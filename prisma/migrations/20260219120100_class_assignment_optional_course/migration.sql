-- AlterTable: Make ClassAssignment.courseId optional (null = General / Class Teacher)
ALTER TABLE "ClassAssignment" ALTER COLUMN "courseId" DROP NOT NULL;

-- Ensure only one "general" (no subject) assignment per teacher per class
CREATE UNIQUE INDEX "ClassAssignment_teacherId_classId_general_key" ON "ClassAssignment"("teacherId", "classId") WHERE "courseId" IS NULL;
