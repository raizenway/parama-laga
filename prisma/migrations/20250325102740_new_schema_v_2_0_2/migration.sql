/*
  Warnings:

  - Added the required column `document_type_id` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "document_type_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "document_type" (
    "document_type_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "document_type_pkey" PRIMARY KEY ("document_type_id")
);
