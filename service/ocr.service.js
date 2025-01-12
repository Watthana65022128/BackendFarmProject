const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient({
    keyFilename: './config/google-cloud-key.json'
});

exports.processOCR = async function (imagePath) {
    try {
        const [result] = await client.documentTextDetection(imagePath);
        const text = result.fullTextAnnotation.text;
        console.log('Raw OCR Text:', text);

        // แยกบรรทัดและทำความสะอาด
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        console.log('Processed lines:', lines);

        const receipt = {
            receiptDate: null,
            shopName: '',
            totalAmount: 0,
            items: []
        };

        let isParsingItems = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            console.log(`Processing line ${i}:`, line);

            // ตรวจจับวันที่
            if (line.includes('วันที่')) {
                const dateMatches = line.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
                if (dateMatches) {
                    let [_, day, month, year] = dateMatches;
                    if (year.length === 2) year = '25' + year; // ปี พ.ศ.
                    receipt.receiptDate = new Date(parseInt(year) - 543, parseInt(month) - 1, parseInt(day));
                }
                continue;
            }

            // ตรวจจับชื่อร้าน
            if (!receipt.shopName && (line.startsWith('ร้าน') || i === 0)) {
                receipt.shopName = line;
                continue;
            }

            // ตรวจจับยอดรวม
            if (line.match(/รวมเงิน|Total/i)) {
                const totalMatch = line.match(/[\d,]+/);
                if (totalMatch) {
                    receipt.totalAmount = parseFloat(totalMatch[0].replace(/,/g, ''));
                }
                isParsingItems = false;
                continue;
            }

            // เริ่มอ่านรายการสินค้า
            if (isParsingItems) {
                const itemMatch = line.match(/^(.+?)\s+(\d+(?:,\d+)?)$/);
                if (itemMatch) {
                    const [_, description, amount] = itemMatch;
                    receipt.items.push({
                        description: description.trim(),
                        amount: parseFloat(amount.replace(/,/g, '')),
                        categoryId: getCategoryId(description)
                    });
                } else if (!line.match(/^[\d,]+$/) && i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    if (nextLine.match(/^[\d,]+$/)) {
                        receipt.items.push({
                            description: line,
                            amount: parseFloat(nextLine.replace(/,/g, '')),
                            categoryId: getCategoryId(line)
                        });
                        i++;
                    }
                }
            }

            // ตรวจจับการเริ่มต้นอ่านรายการ
            if (line.match(/รายการ|Description/i)) {
                isParsingItems = true;
                continue;
            }
        }

        // ทำความสะอาดข้อมูล
        receipt.items = receipt.items.filter(item => item.description && item.amount > 0);

        if (!receipt.shopName) {
            receipt.shopName = 'ไม่ระบุชื่อร้าน';
        }

        if (receipt.items.length === 0) {
            throw new Error('ไม่พบรายการสินค้าในใบเสร็จ');
        }

        console.log('Final receipt:', receipt);
        return receipt;

    } catch (error) {
        console.error('OCR Error:', error);
        throw error;
    }
};

function getCategoryId(description) {
    const desc = description.toLowerCase();
    const keywords = {
        4: ['เมล็ด', 'พันธุ์', 'ข้าวโพด', 'ข้าว', 'กล้า'],
        5: ['ยาฆ่า', 'สารเคมี', 'ยากำจัด', 'เชื้อรา'],
        7: ['ค่าน้ำ', 'ประปา'],
        8: ['ไฟ', 'ไฟฟ้า'],
        6: ['ปุ๋ย', 'ฮอร์โมน'],
        2: ['แรงงาน', 'จ้าง', 'คนงาน'],
        3: ['ขนส่ง', 'ขน', 'รถ']
    };

    for (const [categoryId, keywordList] of Object.entries(keywords)) {
        if (keywordList.some(keyword => desc.includes(keyword))) {
            return parseInt(categoryId);
        }
    }

    return 1; // หมวดหมู่ทั่วไป
}
