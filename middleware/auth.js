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