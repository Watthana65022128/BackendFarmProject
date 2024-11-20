const prisma = require('../prisma/prisma')

exports.createFarm = async (req, res) => {
    try {
        const { name, startMonth, endMonth } = req.body;
        
        if (!name || !startMonth || !endMonth) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        const validMonths = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        
        if (!validMonths.includes(startMonth) || !validMonths.includes(endMonth)) {
            return res.status(400).json({ message: 'เดือนไม่ถูกต้อง' });
        }

        const newFarm = await prisma.farm.create({
            data: {
                name: name.trim(),
                startMonth,
                endMonth,
                createAt: new Date()
            }
        });

        res.status(201).json({
            message: 'สร้างไร่สำเร็จ',
            data: newFarm
        });
        
        console.log(`Created farm: ${name} at ${new Date().toISOString()}`);

    } catch (error) {
        console.error('Error creating farm:', error);
        res.status(500).json({ 
            message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getFarms = async (req, res) => {
    try {
        const farms = await prisma.farm.findMany({
            orderBy: {
                createAt: 'desc'
            }
        }); 
        
        if (farms.length === 0) {
            return res.status(404).json({ message: 'ไม่มีฟาร์ม' });
        }

        res.status(200).json(farms); 
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'Server Error',
            message: error.message
        });
    }
};


exports.getFarmId = async (req, res) => {
    try {
        const { id } = req.params;
        
        // ตรวจสอบ ID
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'รูปแบบ ID ไม่ถูกต้อง'
            });
        }
        
        // ค้นหาข้อมูลฟาร์ม
        const farm = await prisma.farm.findUnique({
            where: {
                id: Number(id)
            },
            // เพิ่ม select เพื่อระบุ fields ที่ต้องการ
            select: {
                id: true,
                name: true,
                startMonth: true,
                endMonth: true,
            }
        });
        
        // ถ้าไม่พบข้อมูล
        if (!farm) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบข้อมูลในฟาร์ม'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: farm
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
};


exports.removeFarm = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                error: 'รูปแบบ ID ไม่ถูกต้อง'
            });
        }

        await prisma.farm.delete({
            where: {
                id: Number(id)
            }
        });

        return res.status(200).json({
            message: 'ลบข้อมูลไร่เรียบร้อยแล้ว'
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'Server Error',
            message: error.message
        });
    }
};

exports.deleteFarmAll = async (req, res) => {
    try {
        
        const result = await prisma.farm.deleteMany();

        if (result.count === 0) {
            return res.status(404).json({
                message: 'ไม่มีฟาร์มให้ลบ'
            });
        }

        return res.status(200).json({
            message: 'ลบฟาร์มทั้งหมดเรียบร้อยแล้ว',
            deletedCount: result.count 
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'Server Error',
            message: error.message
        });
    }
};