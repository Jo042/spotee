-- CreateTable
CREATE TABLE "folders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "spot_id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "folders_user_id_name_key" ON "folders"("user_id", "name");

-- CreateIndex
CREATE INDEX "bookmarks_folder_id_created_at_idx" ON "bookmarks"("folder_id", "created_at");

-- CreateIndex
CREATE INDEX "bookmarks_spot_id_idx" ON "bookmarks"("spot_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_spot_id_folder_id_key" ON "bookmarks"("user_id", "spot_id", "folder_id");

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "spots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
