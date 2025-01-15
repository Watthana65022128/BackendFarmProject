const prisma = require('../prisma/prisma')
const { processOCR } = require('../service/ocr.service')
const fs = require('fs')

exports.scanReceipt = async function(req, res) {
    try {
        const userId = req.userId
        const { farmId } = req.body
        const { path: imagePath } = req.file

        // Validation
        if (!farmId) {
            return res.status(400).json({
                error: 'กรุณาระบุฟาร์ม'
            })
        }

        // เช็คว่าฟาร์มมีอยู่จริงและเป็นของ user นี้
        const farm = await prisma.farm.findFirst({
            where: {
                id: parseInt(farmId),
                userId: parseInt(userId)
            }
        })

        if (!farm) {
            return res.status(404).json({
                error: 'ไม่พบฟาร์มที่ระบุ'
            })
        }

        // ประมวลผล OCR
        const ocrResult = await processOCR(imagePath)

        // ตรวจสอบผลลัพธ์ OCR
        if (!ocrResult.items || ocrResult.items.length === 0) {
            return res.status(400).json({
                error: 'ไม่สามารถอ่านรายการในใบเสร็จได้'
            })
        }

        res.status(200).json({
            message: 'สแกนใบเสร็จสำเร็จ',
            imagePath: imagePath,
            receipt: {
                ...ocrResult,
                userId: parseInt(userId),
                farmId: parseInt(farmId)
            }
        })

    } catch (err) {
        console.log('Error scanning receipt:', err)
        
        // ลบไฟล์รูปถ้าเกิด error
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.log('Error deleting file:', unlinkErr)
            })
        }

        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการสแกนใบเสร็จ'
        })
    }
}

// ปรับปรุง createReceipt ให้รับข้อมูลที่แก้ไขแล้ว
exports.createReceipt = async function(req, res) {
    try {
        const userId = req.userId
        const { 
            farmId,
            imagePath,
            shopName,
            receiptDate,
            totalAmount,
            items,
            defaultCategoryId 
        } = req.body

        // Validation
        if (!farmId || !items || items.length === 0) {
            return res.status(400).json({
                error: 'กรุณาระบุข้อมูลให้ครบถ้วน'
            })
        }

        // เช็คว่าฟาร์มมีอยู่จริงและเป็นของ user นี้
        const farm = await prisma.farm.findFirst({
            where: {
                id: parseInt(farmId),
                userId: parseInt(userId)
            }
        })

        if (!farm) {
            return res.status(404).json({
                error: 'ไม่พบฟาร์มที่ระบุ'
            })
        }

        // ตรวจสอบ category ถ้ามีการระบุมา
        if (defaultCategoryId) {
            const category = await prisma.expenseCategory.findUnique({
                where: {
                    id: parseInt(defaultCategoryId)
                }
            })

            if (!category) {
                return res.status(404).json({
                    error: 'ไม่พบหมวดหมู่ค่าใช้จ่ายที่ระบุ'
                })
            }
        }

        // บันทึกลงฐานข้อมูล
        const receipt = await prisma.receipt.create({
            data: {
                userId: parseInt(userId),
                farmId: parseInt(farmId),
                receiptDate: new Date(receiptDate),
                shopName,
                totalAmount,
                imageUrl: imagePath,
                items: {
                    create: items.map(item => ({
                        description: item.description,
                        amount: item.amount,
                        categoryId: item.categoryId || parseInt(defaultCategoryId || 1)
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        category: true
                    }
                },
                farm: {
                    select: {
                        name: true
                    }
                }
            }
        })

        res.status(201).json({
            message: 'สร้างใบเสร็จสำเร็จ',
            receipt
        })

    } catch (err) {
        console.log('Error creating receipt:', err)
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการสร้างใบเสร็จ'
        })
    }
}
exports.deleteReceipt = async function(req, res) {
    try {
        const userId = req.userId
        const { id } = req.params

        // ตรวจสอบว่าใบเสร็จมีอยู่และเป็นของ user นี้
        const receipt = await prisma.receipt.findFirst({
            where: {
                id: parseInt(id),
                userId: parseInt(userId)
            },
            include: {
                items: true
            }
        })

        if (!receipt) {
            return res.status(404).json({
                error: 'ไม่พบใบเสร็จ'
            })
        }

        // ลบไฟล์รูปภาพ
        if (receipt.imageUrl) {
            fs.unlink(receipt.imageUrl, (err) => {
                if (err) console.log('Error deleting image:', err)
            })
        }

        // ลบข้อมูลในฐานข้อมูล
        await prisma.receipt.delete({
            where: {
                id: parseInt(id)
            }
        })

        res.status(200).json({
            message: 'ลบใบเสร็จสำเร็จ'
        })

    } catch (err) {
        console.log('Error deleting receipt:', err)
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการลบใบเสร็จ'
        })
    }
}
