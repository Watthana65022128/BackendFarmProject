/*
  Warnings:

  - You are about to drop the column `price` on the `receipt_items` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `receipt_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `receipt_items` DROP COLUMN `price`,
    DROP COLUMN `quantity`;
