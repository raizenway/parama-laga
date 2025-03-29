/*
  Warnings:

  - You are about to drop the column `iteration` on the `tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "iteration",
ADD COLUMN     "completed_date" TIMESTAMP(3);
