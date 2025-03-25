-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_type"("document_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;
