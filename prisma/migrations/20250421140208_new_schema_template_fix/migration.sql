/*
  Warnings:

  - You are about to drop the column `template_id` on the `tasks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_template_id_fkey";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "template_id",
ADD COLUMN     "template_snapshot" TEXT;
