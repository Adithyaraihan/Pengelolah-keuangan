/*
  Warnings:

  - You are about to drop the column `userId` on the `transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_userId_fkey`;

-- DropIndex
DROP INDEX `Transaction_userId_transactionDate_idx` ON `transaction`;

-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `userId`;
