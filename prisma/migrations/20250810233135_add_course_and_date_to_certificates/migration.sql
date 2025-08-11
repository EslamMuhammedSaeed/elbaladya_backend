-- AlterTable
ALTER TABLE "Certificates" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "date" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Certificates" ADD CONSTRAINT "Certificates_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
