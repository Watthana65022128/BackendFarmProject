const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    try {
        // เช็คว่ามี admin อยู่แล้วหรือไม่
        const existingAdmin = await prisma.user.findFirst({
            where: {
                isAdmin: true
            }
        });

        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // สร้างรหัสผ่านแฮช
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash('Az-123456', salt)

        // สร้าง admin user
        const admin = await prisma.user.create({
            data: {
                username: 'admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                age: '30',
                address: 'Admin Address',
                isAdmin: true,
            }
        });

        console.log('Created admin user successfully:', admin);

    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();