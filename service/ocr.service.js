// service/ocr.service.js
const vision = require('@google-cloud/vision')
const client = new vision.ImageAnnotatorClient({
    keyFilename: './config/google-cloud-key.json'
})

function getCategoryId(description) {
    description = description.toLowerCase()
    
    // กำหนดคำสำคัญของแต่ละหมวดหมู่
    const categoryKeywords = {
        1: ['อุปกรณ์', 'ถุงมือ', 'กรรไกร', 'มีด', 'ถุง', 'ถาด', 'tree o', 'เชือก', 'ตะกร้า', 'กระถาง'],
        2: ['แรงงาน', 'ค่าจ้าง', 'เงินเดือน'],
        3: ['ขนส่ง', 'ค่ารถ', 'น้ำมัน', 'เบนซิน', 'ดีเซล'],
        4: ['เมล็ด', 'ต้นกล้า', 'พันธุ์', 'กิ่งพันธุ์', 'มันเทศ', 'มันแกว', 'เผือก'],
        5: ['ยาฆ่า', 'สารเคมี', 'ยากำจัด', 'เชื้อรา', 'มายช็อน'],
        6: ['ปุ๋ย', 'ฮอร์โมน', 'น้ำตาลี'],
        7: ['น้ำ', 'ประปา'],
        8: ['ไฟฟ้า', 'ค่าไฟ']
    }

    // ตรวจสอบคำสำคัญในแต่ละหมวดหมู่
    for (const [categoryId, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => description.includes(keyword))) {
            return parseInt(categoryId)
        }
    }

    return 1  // ค่าเริ่มต้น: ค่าอุปกรณ์
}

exports.processOCR = async function(imagePath) {
    try {
        console.log('Starting OCR process for:', imagePath)
        const [result] = await client.documentTextDetection(imagePath)
        const fullText = result.fullTextAnnotation.text
        console.log('Raw OCR Text:', fullText)

        const lines = fullText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)

        const receipt = {
            receiptDate: new Date(),
            shopName: '',
            totalAmount: 0,
            items: []
        }

        let currentItem = null
        let isItemSection = false

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            console.log('Processing line:', line)

            // ตรวจสอบวันที่
            if (line.includes('วันที่')) {
                const dateMatch = line.match(/(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{2,4})/)
                if (dateMatch) {
                    let [_, day, month, year] = dateMatch
                    if (year.length === 2) year = '25' + year
                    receipt.receiptDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                }
                continue
            }

            // ตรวจสอบชื่อร้าน
            if (!receipt.shopName && i < 3 && !line.includes('CASH') && !line.includes('วันที่')) {
                receipt.shopName = line
                continue
            }

            // เริ่มส่วนรายการสินค้า
            if (line.includes('Quantity') || line.includes('จำนวน')) {
                isItemSection = true
                continue
            }

            // ตรวจสอบยอดรวม
            if (line.match(/รวมเงิน|Total/i)) {
                const totalMatch = line.match(/\d+/)
                if (totalMatch) {
                    receipt.totalAmount = parseFloat(totalMatch[0])
                }
                continue
            }

            // ตรวจจับรายการสินค้า
            const itemMatch = line.match(/^(\d+)\s+(.+?)\s+(\d+)\s+(\d+)$/)
            if (itemMatch) {
                const [_, qty, desc, price, amount] = itemMatch
                const item = {
                    quantity: qty,
                    description: desc.trim(),
                    price: parseFloat(price),
                    amount: parseFloat(amount),
                    categoryId: getCategoryId(desc.trim())
                }
                receipt.items.push(item)
                console.log('Found item:', item)
            }
        }

        // ถ้าไม่พบรายการสินค้าในรูปแบบปกติ
        if (receipt.items.length === 0) {
            console.log('Trying alternative item format...')
            for (let i = 0; i < lines.length; i++) {
                if (/^\d+$/.test(lines[i])) {  // ถ้าบรรทัดมีแต่ตัวเลข (จำนวน)
                    const qty = lines[i]
                    if (i + 1 < lines.length && i + 2 < lines.length) {  // ตรวจสอบว่ามีบรรทัดถัดไป
                        const desc = lines[i + 1]
                        const price = lines[i + 2]
                        if (/^\d+$/.test(price)) {  // ถ้าบรรทัดที่ 3 เป็นตัวเลข (ราคา)
                            const item = {
                                quantity: qty,
                                description: desc.trim(),
                                price: parseFloat(price),
                                amount: parseFloat(qty) * parseFloat(price),
                                categoryId: getCategoryId(desc.trim())
                            }
                            receipt.items.push(item)
                            console.log('Found item (alternative format):', item)
                            i += 2  // ข้ามไป 2 บรรทัด
                        }
                    }
                }
            }
        }

        if (receipt.items.length === 0) {
            throw new Error('ไม่พบรายการสินค้าในใบเสร็จ')
        }

        console.log('Final receipt:', receipt)
        return receipt

    } catch (error) {
        console.error('OCR Error:', error)
        throw error
    }
}