-- CreateEnum
CREATE TYPE "ComponentType" AS ENUM ('page', 'form');

-- CreateTable
CREATE TABLE "components" (
    "id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "ComponentType" NOT NULL DEFAULT 'page',
    "config" JSONB,
    "parameters" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "components_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "components_app_id_idx" ON "components"("app_id");

-- CreateIndex
CREATE UNIQUE INDEX "components_app_id_slug_key" ON "components"("app_id", "slug");

-- AddForeignKey
ALTER TABLE "components" ADD CONSTRAINT "components_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
