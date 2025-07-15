/*
  Warnings:

  - A unique constraint covering the columns `[facultyId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Student_facultyId_key" ON "Student"("facultyId");
