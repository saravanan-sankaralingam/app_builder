-- CreateEnum
CREATE TYPE "AppType" AS ENUM ('app', 'portal');

-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('draft', 'live', 'archived');

-- CreateTable
CREATE TABLE "apps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'Folder',
    "icon_bg" TEXT NOT NULL DEFAULT '#dbeafe',
    "type" "AppType" NOT NULL DEFAULT 'app',
    "status" "AppStatus" NOT NULL DEFAULT 'draft',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "apps_slug_key" ON "apps"("slug");

-- CreateIndex
CREATE INDEX "apps_created_by_id_idx" ON "apps"("created_by_id");

-- CreateIndex
CREATE INDEX "apps_updated_by_id_idx" ON "apps"("updated_by_id");

-- CreateIndex
CREATE INDEX "apps_status_idx" ON "apps"("status");

-- CreateIndex
CREATE INDEX "apps_slug_idx" ON "apps"("slug");

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
