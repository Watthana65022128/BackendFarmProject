const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // ตัวอย่าง: "Bearer <JWT_TOKEN>"

    if (!token) {
        return res.status(401).json({
            error: 'ต้องมี Authorization token'
        });
    }

    // ตรวจสอบ token และ decode
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                error: 'Token ไม่ถูกต้องหรือหมดอายุ'
            });
        }
        req.userId = decoded.id; // เก็บ userId จาก token ใน request
        next(); 
    });
};

exports.validateRegister = (req, res, next) => {
    const { username, email, password, age, address } = req.body

    if (!username || username.length < 3) {
        return res.status(400).json({
            error: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'
        })
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({
            error: 'อีเมลไม่ถูกต้อง'
        })
    }

    if (!password || password.length < 6) {
        return res.status(400).json({
            error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
        })
    }

    if (!/[a-z]/.test(password)) {
        return res.status(400).json({
            error: 'รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว'
        });
    }

    if (!/[A-Z]/.test(password)) {
        return res.status(400).json({
            error: 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว'
        });
    }

    if (!/\d/.test(password)) {
        return res.status(400).json({
            error: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว'
        });
    }

    if (!/[@$!%*?&_-]/.test(password)) {
        return res.status(400).json({
            error: 'รหัสผ่านต้องมีอักขระพิเศษ อย่างน้อย 1 ตัว'
        });
    }

    if (!age || age < 1 || age > 120) {
        return res.status(400).json({
            error: 'อายุไม่ถูกต้อง'
        })
    }


    if (!address || address.trim().length === 0) {
        return res.status(400).json({
            error: 'กรุณากรอกที่อยู่'
        })
    }

    next()
}