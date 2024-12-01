-- Step 1: เพิ่มคอลัมน์ `userId` ให้สามารถเป็น NULL ได้ (เพื่อไม่ให้เกิดปัญหา)
ALTER TABLE `farms`
ADD COLUMN `userId` INTEGER DEFAULT NULL;

-- Step 2: อัปเดตค่า `userId` สำหรับแถวที่ไม่มีค่า (โดยสมมติว่า `userId = 1` สำหรับทุกแถวที่ไม่มีค่า)
UPDATE `farms` SET `userId` = 1 WHERE `userId` IS NULL;


-- Step 3: เพิ่ม Foreign Key Constraint สำหรับ `userId`
ALTER TABLE `farms`
ADD CONSTRAINT `fk_user_id`
FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;
