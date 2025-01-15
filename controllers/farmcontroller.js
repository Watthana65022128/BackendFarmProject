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

        const userId = req.userId; //  userId มาจากการ login (หรือ JWT token)

        if (!userId) {
            return res.status(400).json({ message: 'ผู้ใช้ไม่ถูกต้อง' });
        }

        const newFarm = await prisma.farm.create({
            data: {
                name: name.trim(),
                startMonth,
                endMonth,
                createAt: new Date(), 
                user: {
                    connect: {
                        id: userId // เชื่อมกับ user.id จาก JWT token
                    }
                }
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
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
        }

        const farms = await prisma.farm.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                name: true,
                startMonth: true,
                endMonth: true,
                budget: true, 
                createAt: true
            }
        });

        res.json(farms);
    } catch (error) {
        console.error('Error fetching farms:', error);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลไร่',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


exports.removeFarm = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId; // userId มาจาก JWT token

        if (!userId) {
            return res.status(401).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
        }

        if (!id || isNaN(id)) {
            return res.status(400).json({
                error: 'รูปแบบ ID ไม่ถูกต้อง'
            });
        }

        // ตรวจสอบว่าไร่ที่ต้องการลบเป็นของผู้ใช้คนเดียวกัน
        const farm = await prisma.farm.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!farm) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลไร่ที่ต้องการลบ' });
        }

        if (farm.userId !== userId) {
            return res.status(403).json({ message: 'คุณไม่สามารถลบไร่ของผู้ใช้อื่นได้' });
        }

        // ลบฟาร์ม
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

exports.updateBudget = async (req, res) => {
    try {
        const { farmId, budget } = req.body;
        const userId = req.userId;

        if (!farmId || !budget) {
            return res.status(400).json({ message: 'กรุณาระบุข้อมูลให้ครบถ้วน' });
        }

        // ตรวจสอบว่าไร่นี้เป็นของผู้ใช้หรือไม่
        const farm = await prisma.farm.findFirst({
            where: {
                id: parseInt(farmId),
                userId: parseInt(userId)
            }
        });

        if (!farm) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลไร่' });
        }

        // อัพเดทงบประมาณ
        const updatedFarm = await prisma.farm.update({
            where: {
                id: parseInt(farmId)
            },
            data: {
                budget: parseFloat(budget)
            }
        });

        res.status(200).json({
            message: 'อัพเดทงบประมาณสำเร็จ',
            data: updatedFarm
        });

    } catch (error) {
        console.error('Error updating budget:', error);
        res.status(500).json({ 
            message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

