const prisma = require('../prisma/prisma')
const bcrypt = require('bcryptjs')

exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                isAdmin: true,
                isBanned: true,
                bannedReason: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.status(200).json({
            message: 'ดึงข้อมูลผู้ใช้ทั้งหมดสำเร็จ',
            users
        });
    } catch (err) {
        console.error('Error getting users:', err);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
        });
    }
};

exports.banUser = async (req, res) => {
    try {
        const { userId, reason } = req.body;

        if (!userId) {
            return res.status(400).json({
                error: 'กรุณาระบุ ID ผู้ใช้'
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });

        if (!user) {
            return res.status(404).json({
                error: 'ไม่พบผู้ใช้'
            });
        }

        // อัพเดทสถานะการแบน
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                isBanned: true,
                bannedReason: reason || 'ไม่ระบุเหตุผล',
                bannedAt: new Date()
            }
        });

        res.status(200).json({
            message: 'แบนผู้ใช้สำเร็จ',
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                isBanned: updatedUser.isBanned,
                bannedReason: updatedUser.bannedReason,
                bannedAt: updatedUser.bannedAt
            }
        });
    } catch (err) {
        console.error('Error banning user:', err);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการแบนผู้ใช้'
        });
    }
};

exports.unbanUser = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                error: 'กรุณาระบุ ID ผู้ใช้'
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });

        if (!user) {
            return res.status(404).json({
                error: 'ไม่พบผู้ใช้'
            });
        }

        // ยกเลิกการแบน
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                isBanned: false,
                bannedReason: null,
                bannedAt: null
            }
        });

        res.status(200).json({
            message: 'ยกเลิกการแบนผู้ใช้สำเร็จ',
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                isBanned: updatedUser.isBanned
            }
        });
    } catch (err) {
        console.error('Error unbanning user:', err);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการยกเลิกการแบนผู้ใช้'
        });
    }
};