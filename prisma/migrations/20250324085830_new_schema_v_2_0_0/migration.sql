/*
  Warnings:

  - You are about to drop the `role` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" TEXT;

-- DropTable
DROP TABLE "role";

-- CreateTable
CREATE TABLE "role_access" (
    "role_id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "role_access_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "checklists" (
    "checklist_id" SERIAL NOT NULL,
    "criteria" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "checklists_pkey" PRIMARY KEY ("checklist_id")
);

-- CreateTable
CREATE TABLE "task_templates" (
    "template_id" SERIAL NOT NULL,
    "template_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "task_templates_pkey" PRIMARY KEY ("template_id")
);

-- CreateTable
CREATE TABLE "template_checklists" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER NOT NULL,
    "checklist_id" INTEGER NOT NULL,

    CONSTRAINT "template_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "task_id" SERIAL NOT NULL,
    "task_name" TEXT NOT NULL,
    "template_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date_added" TIMESTAMP(3) NOT NULL,
    "iteration" INTEGER NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE "task_progress" (
    "progress_id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "checklist_id" INTEGER NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "task_progress_pkey" PRIMARY KEY ("progress_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_access_role_name_key" ON "role_access"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "task_templates_template_name_key" ON "task_templates"("template_name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role_access"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_checklists" ADD CONSTRAINT "template_checklists_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "task_templates"("template_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_checklists" ADD CONSTRAINT "template_checklists_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "checklists"("checklist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "task_templates"("template_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_progress" ADD CONSTRAINT "task_progress_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_progress" ADD CONSTRAINT "task_progress_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "checklists"("checklist_id") ON DELETE RESTRICT ON UPDATE CASCADE;
