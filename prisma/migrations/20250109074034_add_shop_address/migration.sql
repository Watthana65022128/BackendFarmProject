/*
  Warnings:

  - Added the required column `shopAddress` to the `receipts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `receipts` ADD COLUMN `shopAddress` VARCHAR(191) NOT NULL;
