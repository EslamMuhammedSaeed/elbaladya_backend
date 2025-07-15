/*
  Warnings:

  - You are about to drop the column `grade` on the `StudentCourse` table. All the data in the column will be lost.
  - You are about to drop the column `lastAttempt` on the `StudentCourse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "numberOfExams" INTEGER DEFAULT 0,
ADD COLUMN     "numberofAssignments" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "hadTutorial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastAttempt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "StudentCourse" DROP COLUMN "grade",
DROP COLUMN "lastAttempt",
ADD COLUMN     "numberOfAttemptsOnTests" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "testResult" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trainingResult" INTEGER NOT NULL DEFAULT 0;
