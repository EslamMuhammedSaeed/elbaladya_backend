/*
  Warnings:

  - You are about to drop the column `courseId` on the `Certificates` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Certificates" DROP CONSTRAINT "Certificates_courseId_fkey";

-- AlterTable
ALTER TABLE "Certificates" DROP COLUMN "courseId";
