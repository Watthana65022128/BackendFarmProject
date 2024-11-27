const prisma = require('../prisma/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.userId; // ดึง userId จาก request ที่ได้จาก middleware

        if (!userId) {
            return res.status(400).json({
                error: 'ไม่พบ userId ใน request'
            });
        }

        // ค้นหาผู้ใช้จากฐานข้อมูลโดยใช้ userId
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            return res.status(404).json({
                error: 'ไม่พบผู้ใช้'
            });
        }

        // ส่งข้อมูลผู้ใช้กลับ (ไม่รวมรหัสผ่าน)
        const { password: _, ...userData } = user;

        return res.status(200).json({
            message: 'ดึงข้อมูลโปรไฟล์สำเร็จ',
            user: userData
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้'
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                age: true,
                address: true,
                createdAt: true, 
                updatedAt: true  
            }
        });

        if (users.length === 0) {
            return res.status(404).json({
                error: 'ไม่พบผู้ใช้ในระบบ'
            });
        }

        res.status(200).json({
            message: 'ดึงข้อมูลผู้ใช้ทั้งหมดสำเร็จ',
            users
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ทั้งหมด'
        });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, email, password, age, address } = req.body

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        })

        if (existingUser) {
            return res.status(400).json({
                error: existingUser.username === username 
                    ? 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' 
                    : 'อีเมลนี้ถูกใช้งานแล้ว'
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                age,
                address
            }
        })

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        // Return response (excluding password)
        const { password: _, ...userData } = user
        res.status(201).json({
            message: 'ลงทะเบียนสำเร็จ',
            user: userData,
            token
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการลงทะเบียน'
        })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return res.status(400).json({
                error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
            })
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        const { password: _, ...userData } = user
        res.status(200).json({
            message: 'เข้าสู่ระบบสำเร็จ',
            user: userData,
            token
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
        })
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password, age, address } = req.body;

        if (!id) {
            return res.status(400).json({
                error: 'โปรดระบุ id ของผู้ใช้'
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: Number(id) }
        });

        if (!existingUser) {
            return res.status(404).json({
                error: 'ไม่พบผู้ใช้'
            });
        }

        const updatedData = {};
        if (username) updatedData.username = username;
        if (email) updatedData.email = email;
        if (age) updatedData.age = age;
        if (address) updatedData.address = address;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: updatedData
        });

        const { password: _, ...userData } = updatedUser;

        res.status(200).json({
            message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
            user: userData
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้'
        });
    }
};
