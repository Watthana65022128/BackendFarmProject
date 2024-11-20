const prisma = require('../prisma/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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


exports.getUserId = async (req, res) => {
    try {

        const { id, username } = req.params;

        if (!id && !username) {
            return res.status(400).json({
                error: 'โปรดระบุ id หรือ username'
            });
        }

        const user = await prisma.user.findFirst({
            where: id 
                ? { id: Number(id) } 
                : { username }
        });

        if (!user) {
            return res.status(404).json({
                error: 'ไม่พบผู้ใช้'
            });
        }

        const { password: _, ...userData } = user;

        res.status(200).json({
            user: userData
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
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
