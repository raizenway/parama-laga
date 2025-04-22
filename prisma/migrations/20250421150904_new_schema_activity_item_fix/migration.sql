-- DropForeignKey
ALTER TABLE "activity_results" DROP CONSTRAINT "activity_results_item_id_fkey";

-- AddForeignKey
ALTER TABLE "activity_results" ADD CONSTRAINT "activity_results_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "activity_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
