/*
  Warnings:

  - You are about to drop the column `unit` on the `receipt_items` table. All the data in the column will be lost.
  - You are about to drop the column `receiptNumber` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `shopAddress` on the `receipts` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `receipt_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `receipt_items` DROP COLUMN `unit`,
    ADD COLUMN `quantity` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `receipts` DROP COLUMN `receiptNumber`,
    DROP COLUMN `shopAddress`;
