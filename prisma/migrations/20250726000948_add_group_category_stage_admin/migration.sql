-- CreateEnum
CREATE TYPE "Category" AS ENUM ('admin', 'student');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('stage_1', 'stage_2');

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "groupId" TEXT;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'student';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "stage" "Stage" NOT NULL DEFAULT 'stage_2';

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
