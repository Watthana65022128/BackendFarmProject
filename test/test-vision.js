// test/test-vision.js
const vision = require('@google-cloud/vision');
const fs = require('fs');

async function testVisionAPI() {
    try {
        console.log('1. เริ่มทดสอบการเชื่อมต่อ Google Cloud Vision API...');

        // ตรวจสอบไฟล์ key
        if (!fs.existsSync('./config/google-cloud-key.json')) {
            throw new Error('ไม่พบไฟล์ key ในโฟลเดอร์ config');
        }
        console.log('2. ตรวจพบไฟล์ key ✓');

        // สร้าง client
        const client = new vision.ImageAnnotatorClient({
            keyFilename: './config/google-cloud-key.json'
        });
        console.log('3. สร้าง Vision Client สำเร็จ ✓');

        // ทดสอบอ่านรูปภาพ
        console.log('4. กำลังทดสอบอ่านรูปภาพ...');
        const [result] = await client.textDetection('./test/test.jpg');

        if (result && result.textAnnotations && result.textAnnotations.length > 0) {
            console.log('\n=== ผลการอ่านข้อความจากรูป ===');
            console.log(result.textAnnotations[0].description);
            console.log('\n=== การทดสอบเสร็จสมบูรณ์ ✓ ===');
        } else {
            console.log('ไม่พบข้อความในรูปภาพ หรือไม่สามารถอ่านข้อความได้');
        }

    } catch (error) {
        console.error('\n❌ เกิดข้อผิดพลาด:');
        console.error(error);

        // ตรวจสอบสาเหตุของ error ที่พบบ่อย
        if (error.message.includes('Cannot find module')) {
            console.log('\nวิธีแก้ไข: ติดตั้ง package ก่อนใช้งาน');
            console.log('npm install @google-cloud/vision');
        }
        if (error.message.includes('no such file')) {
            console.log('\nวิธีแก้ไข: ตรวจสอบตำแหน่งของไฟล์และโฟลเดอร์');
            console.log('- ต้องมีโฟลเดอร์ config');
            console.log('- ต้องมีไฟล์ google-cloud-key.json ในโฟลเดอร์ config');
            console.log('- ต้องมีไฟล์รูปภาพ test.jpg ในโฟลเดอร์ test');
        }
    }
}

// เรียกใช้ฟังก์ชัน
console.log('=== เริ่มการทดสอบ ===\n');
testVisionAPI();