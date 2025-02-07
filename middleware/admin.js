// middleware/admin.js
const prisma = require('../prisma/prisma');

exports.isAdmin = async (req, res, next) => {
    try {
        const userId = req.userId;
        
        if (!userId) {
            return res.status(401).json({
                error: 'ไม่พบข้อมูลผู้ใช้'
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(userId)
            }
        });

        if (!user || !user.isAdmin) {
            return res.status(403).json({
                error: 'ไม่มีสิทธิ์เข้าถึง'
            });
        }

        next();
    } catch (err) {
        console.error('Error checking admin status:', err);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์'
        });
    }
};