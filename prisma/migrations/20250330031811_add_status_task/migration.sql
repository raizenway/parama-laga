/*
  Warnings:

  - Added the required column `taskStatus` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('Done', 'OnGoing', 'ToDo', 'NotStarted');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "taskStatus" "TaskStatus" NOT NULL;
