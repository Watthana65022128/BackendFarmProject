const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient({
    keyFilename: './config/google-cloud-key.json'
});
 
function getCategoryId(description) {
    const desc = description.toLowerCase();
    const keywords = {
        4: ['เมล็ด', 'พันธุ์', 'ข้าวโพด', 'ข้าว', 'กล้า'],
        5: ['ยาฆ่า', 'ยากำจัด', 'เชื้อรา', 'สารกำจัด'],
        7: ['ค่าน้ำ', 'ประปา'],
        8: ['ไฟ', 'ไฟฟ้า'],
        6: ['ปุ๋ย', 'ฮอร์โมน'],
        2: ['แรงงาน', 'จ้าง', 'คนงาน'],
    };
 
    for (const [categoryId, keywordList] of Object.entries(keywords)) {
        if (keywordList.some(keyword => desc.includes(keyword))) {
            return parseInt(categoryId);
        }
    }
 
    return 1;
}
 
exports.processOCR = async function (imagePath) {
    try {
        const [result] = await client.documentTextDetection(imagePath);
        const text = result.fullTextAnnotation.text;
       
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
       
        console.log('Processed lines:', lines);
 
        const receipt = {
            shopName: '',
            receiptDate: null,
            totalAmount: 0,
            items: []
        };
 
        // หาชื่อร้าน
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('ร้าน')) {
                receipt.shopName = lines[i];
                break;
            }
        }
 
        // หาวันที่
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('วันที่')) {
                const dateMatches = lines[i].match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
                if (dateMatches) {
                    let [_, day, month, year] = dateMatches;
                    if (year.length === 2) year = '25' + year;
                    const yearCE = parseInt(year) - 543;
                    receipt.receiptDate = new Date(yearCE, parseInt(month) - 1, parseInt(day));
                }
                break;
            }
        }
 
        // หายอดรวม
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].toLowerCase();
            if (line.includes('รวมเงิน') || line.includes('total')) {
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1];
                    if (nextLine.match(/^[\d,]+$/)) {
                        receipt.totalAmount = parseFloat(nextLine.replace(/,/g, ''));
                        break;
                    }
                }
            }
        }
 
        // หาตำแหน่งเริ่มต้นและสิ้นสุดของรายการ
        let startIndex = -1;
        let endIndex = -1;
 
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            // หาจุดเริ่มต้น
            if (line.includes('รายการ') || line.includes('description')) {
                startIndex = i + 1;
                continue;
            }
            // หาจุดสิ้นสุด
            if (startIndex !== -1 && (line.includes('รวมเงิน') || line.includes('total'))) {
                endIndex = i;
                break;
            }
        }
 
        // อ่านรายการสินค้า
        if (startIndex !== -1 && endIndex !== -1) {
            for (let i = startIndex; i < endIndex; i++) {
                const line = lines[i].trim();
               
                // ข้ามบรรทัดว่างหรือบรรทัดที่มีแต่ตัวเลข
                if (!line || line.match(/^[\d,.]+$/)) continue;
               
                // หาจำนวนเงินในบรรทัดถัดไป
                let amount = 0;
                for (let j = i + 1; j < Math.min(i + 4, endIndex); j++) {
                    const numLine = lines[j];
                    if (numLine && numLine.match(/^[\d,]+$/)) {
                        const num = parseFloat(numLine.replace(/,/g, ''));
                        if (num > amount) amount = num;
                    }
                }
 
                // ถ้าพบจำนวนเงิน เพิ่มรายการ
                if (amount > 0) {
                    // ตัดจำนวนออกจากรายการ ถ้ามี
                    const descMatch = line.match(/^\d+\s+(.+)$/);
                    const description = descMatch ? descMatch[1] : line;
 
                    receipt.items.push({
                        description: description,
                        amount: amount,
                        categoryId: getCategoryId(description)
                    });
                }
            }
        }
 
        // ตั้งค่าเริ่มต้น
        if (!receipt.shopName) {
            receipt.shopName = 'ไม่ระบุชื่อร้าน';
        }
 
        if (!receipt.receiptDate) {
            receipt.receiptDate = new Date();
        }
 
        console.log('Processed receipt:', receipt);
        return receipt;
 
    } catch (error) {
        console.error('OCR Error:', error);
        throw error;
    }
};