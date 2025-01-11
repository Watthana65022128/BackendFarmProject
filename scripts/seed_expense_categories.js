const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        // สร้างหมวดหมู่ค่าใช้จ่าย
        const categories = await prisma.expenseCategory.createMany({
            data: [
                {
                    name: 'ค่าอุปกรณ์',
                    description: 'ค่าใช้จ่ายสำหรับอุปกรณ์การเกษตรต่างๆ'
                },
                {
                    name: 'ค่าแรง',
                    description: 'ค่าจ้างแรงงานในการทำการเกษตร'
                },
                {
                    name: 'ค่าขนส่ง',
                    description: 'ค่าใช้จ่ายในการขนส่งสินค้าและวัสดุการเกษตร'
                },
                {
                    name: 'ค่าเมล็ดพันธุ์พืช',
                    description: 'ค่าใช้จ่ายสำหรับเมล็ดพันธุ์และต้นกล้า'
                },
                {
                    name: 'ค่าสารเคมี',
                    description: 'ค่าใช้จ่ายสำหรับสารเคมีกำจัดศัตรูพืชและวัชพืช'
                },
                {
                    name: 'ค่าปุ๋ย',
                    description: 'ค่าใช้จ่ายสำหรับปุ๋ยทุกชนิด'
                },
                {
                    name: 'ค่าน้ำ',
                    description: 'ค่าใช้จ่ายสำหรับน้ำในการเกษตร'
                },
                {
                    name: 'ค่าไฟ',
                    description: 'ค่าใช้จ่ายสำหรับไฟฟ้าในการเกษตร'
                }
            ]
        })

        console.log('Created expense categories successfully!')

    } catch (error) {
        console.error('Error creating expense categories:', error)
        if (error.code === 'P2002') {
            console.log('Categories might already exist')
        }
    } finally {
        await prisma.$disconnect()
    }
}

main()