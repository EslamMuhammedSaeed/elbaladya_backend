/*
  Warnings:

  - You are about to drop the column `name` on the `Course` table. All the data in the column will be lost.
  - Added the required column `arabicName` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `englishName` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "name",
ADD COLUMN     "arabicName" TEXT NOT NULL,
ADD COLUMN     "englishName" TEXT NOT NULL;
