-- DropForeignKey
ALTER TABLE "activity_items" DROP CONSTRAINT "activity_items_category_id_fkey";

-- AddForeignKey
ALTER TABLE "activity_items" ADD CONSTRAINT "activity_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "activity_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
