/*
  Warnings:

  - A unique constraint covering the columns `[studentId]` on the table `Device` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Device_studentId_key" ON "Device"("studentId");
