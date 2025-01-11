const prisma = require('../prisma/prisma')
const { processOCR } = require('../service/ocr.service')
const fs = require('fs')

exports.createReceipt = async function(req, res) {
    try {
        const userId = req.userId
        const { farmId, defaultCategoryId } = req.body
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

        // ประมวลผล OCR
        const ocrResult = await processOCR(imagePath)

        // ตรวจสอบผลลัพธ์ OCR
        if (!ocrResult.items || ocrResult.items.length === 0) {
            return res.status(400).json({
                error: 'ไม่สามารถอ่านรายการในใบเสร็จได้'
            })
        }

        // บันทึกลงฐานข้อมูล
        const receipt = await prisma.receipt.create({
            data: {
                userId: parseInt(userId),
                farmId: parseInt(farmId),
                receiptDate: ocrResult.receiptDate,
                shopName: ocrResult.shopName,
                totalAmount: ocrResult.totalAmount,
                imageUrl: imagePath,
                items: {
                    create: ocrResult.items.map(item => ({
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
                        amount: item.amount,
                        categoryId: parseInt(defaultCategoryId || 1)
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
        
        // ลบไฟล์รูปถ้าเกิด error
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.log('Error deleting file:', unlinkErr)
            })
        }

        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการสร้างใบเสร็จ'
        })
    }
}