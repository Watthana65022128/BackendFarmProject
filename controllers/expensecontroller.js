const prisma = require('../prisma/prisma');

exports.getManagementExpenses = async (req, res) => {
    try {
        const farmId = parseInt(req.params.farmId);
        const userId = req.userId;

        // ตรวจสอบว่าฟาร์มเป็นของผู้ใช้นี้
        const farm = await prisma.farm.findFirst({
            where: {
                id: farmId,
                userId: userId
            }
        });

        if (!farm) {
            return res.status(404).json({ error: 'ไม่พบข้อมูลฟาร์ม' });
        }

        // ดึงข้อมูลใบเสร็จและรายการที่เกี่ยวข้องกับการจัดการ
        const receipts = await prisma.receipt.findMany({
            where: {
                farmId: farmId
            },
            include: {
                items: {
                    where: {
                        categoryId: {
                            in: [1, 2, 3]
                        }
                    },
                    include: {
                        category: true
                    }
                }
            }
        });

        // จัดกลุ่มรายการตามหมวดหมู่
        const categories = {
            equipment: { total: 0, items: [] },
            labor: { total: 0, items: [] },
            transportation: { total: 0, items: [] }
        };

        receipts.forEach(receipt => {
            receipt.items.forEach(item => {
                const itemData = {
                    description: item.description,
                    amount: item.amount,
                    date: receipt.receiptDate,
                    shopName: receipt.shopName
                };

                switch (item.categoryId) {
                    case 1:
                        categories.equipment.total += item.amount;
                        categories.equipment.items.push(itemData);
                        break;
                    case 2:
                        categories.labor.total += item.amount;
                        categories.labor.items.push(itemData);
                        break;
                    case 3:
                        categories.transportation.total += item.amount;
                        categories.transportation.items.push(itemData);
                        break;
                }
            });
        });

        res.json(categories);

    } catch (error) {
        console.error('Error getting management expenses:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};

exports.getProductionExpenses = async (req, res) => {
    try {
        const farmId = parseInt(req.params.farmId);
        const userId = req.userId;

        const farm = await prisma.farm.findFirst({
            where: {
                id: farmId,
                userId: userId
            }
        });

        if (!farm) {
            return res.status(404).json({ error: 'ไม่พบข้อมูลฟาร์ม' });
        }

        const receipts = await prisma.receipt.findMany({
            where: {
                farmId: farmId
            },
            include: {
                items: {
                    where: {
                        categoryId: {
                            in: [4, 5, 6, 7, 8]
                        }
                    },
                    include: {
                        category: true
                    }
                }
            }
        });

        const categories = {
            seeds: { total: 0, items: [] },
            chemicals: { total: 0, items: [] },
            water: { total: 0, items: [] },
            electricity: { total: 0, items: [] },
            fertilizer: { total: 0, items: [] }
        };

        receipts.forEach(receipt => {
            receipt.items.forEach(item => {
                const itemData = {
                    description: item.description,
                    amount: item.amount,
                    date: receipt.receiptDate,
                    shopName: receipt.shopName
                };

                switch (item.categoryId) {
                    case 4:
                        categories.seeds.total += item.amount;
                        categories.seeds.items.push(itemData);
                        break;
                    case 5:
                        categories.chemicals.total += item.amount;
                        categories.chemicals.items.push(itemData);
                        break;
                    case 7:
                        categories.water.total += item.amount;
                        categories.water.items.push(itemData);
                        break;
                    case 8:
                        categories.electricity.total += item.amount;
                        categories.electricity.items.push(itemData);
                        break;
                    case 6:
                        categories.fertilizer.total += item.amount;
                        categories.fertilizer.items.push(itemData);
                        break;
                }
            });
        });

        res.json(categories);

    } catch (error) {
        console.error('Error getting production expenses:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};

// ดึงข้อมูลค่าใช้จ่ายรวมทั้งหมด
exports.getTotalExpenses = async (req, res) => {
    try {
        const farmId = parseInt(req.params.farmId);
        const userId = req.userId;

        // ตรวจสอบว่าฟาร์มเป็นของผู้ใช้นี้
        const farm = await prisma.farm.findFirst({
            where: {
                id: farmId,
                userId: userId
            }
        });

        if (!farm) {
            return res.status(404).json({ error: 'ไม่พบข้อมูลฟาร์ม' });
        }

        // ดึงข้อมูลค่าใช้จ่ายทั้งหมด
        const receipts = await prisma.receipt.findMany({
            where: {
                farmId: farmId
            },
            include: {
                items: {
                    include: {
                        category: true
                    }
                }
            }
        });

        let managementExpenses = 0;
        let productionExpenses = 0;

        receipts.forEach(receipt => {
            receipt.items.forEach(item => {
                // หมวดหมู่ 1-3 เป็นค่าจัดการ, 4-8 เป็นค่าผลิต
                if (item.categoryId <= 3) {
                    managementExpenses += item.amount;
                } else {
                    productionExpenses += item.amount;
                }
            });
        });

        const totalExpenses = managementExpenses + productionExpenses;

        res.json({
            totalExpenses,
            managementExpenses,
            productionExpenses
        });

    } catch (error) {
        console.error('Error getting total expenses:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
};