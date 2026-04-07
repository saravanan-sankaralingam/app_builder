-- CreateEnum
CREATE TYPE "DataLayerType" AS ENUM ('dataform', 'board', 'process');

-- CreateTable
CREATE TABLE "data_layers" (
    "id" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "DataLayerType" NOT NULL DEFAULT 'dataform',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_layers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fields" (
    "id" TEXT NOT NULL,
    "data_layer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "default_value" JSONB,
    "options" JSONB,
    "config" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_steps" (
    "id" TEXT NOT NULL,
    "data_layer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "allowed_next_steps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_items" (
    "id" TEXT NOT NULL,
    "data_layer_id" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "current_step_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "data_layers_app_id_idx" ON "data_layers"("app_id");

-- CreateIndex
CREATE UNIQUE INDEX "data_layers_app_id_slug_key" ON "data_layers"("app_id", "slug");

-- CreateIndex
CREATE INDEX "fields_data_layer_id_idx" ON "fields"("data_layer_id");

-- CreateIndex
CREATE UNIQUE INDEX "fields_data_layer_id_slug_key" ON "fields"("data_layer_id", "slug");

-- CreateIndex
CREATE INDEX "workflow_steps_data_layer_id_idx" ON "workflow_steps"("data_layer_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_steps_data_layer_id_slug_key" ON "workflow_steps"("data_layer_id", "slug");

-- CreateIndex
CREATE INDEX "data_items_data_layer_id_idx" ON "data_items"("data_layer_id");

-- CreateIndex
CREATE INDEX "data_items_current_step_id_idx" ON "data_items"("current_step_id");

-- CreateIndex
CREATE INDEX "data_items_created_by_id_idx" ON "data_items"("created_by_id");

-- AddForeignKey
ALTER TABLE "data_layers" ADD CONSTRAINT "data_layers_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fields" ADD CONSTRAINT "fields_data_layer_id_fkey" FOREIGN KEY ("data_layer_id") REFERENCES "data_layers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_data_layer_id_fkey" FOREIGN KEY ("data_layer_id") REFERENCES "data_layers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_items" ADD CONSTRAINT "data_items_data_layer_id_fkey" FOREIGN KEY ("data_layer_id") REFERENCES "data_layers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
