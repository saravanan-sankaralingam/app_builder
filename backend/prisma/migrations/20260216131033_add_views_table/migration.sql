-- CreateTable
CREATE TABLE "views" (
    "id" TEXT NOT NULL,
    "data_layer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "views_data_layer_id_idx" ON "views"("data_layer_id");

-- CreateIndex
CREATE UNIQUE INDEX "views_data_layer_id_slug_key" ON "views"("data_layer_id", "slug");

-- AddForeignKey
ALTER TABLE "views" ADD CONSTRAINT "views_data_layer_id_fkey" FOREIGN KEY ("data_layer_id") REFERENCES "data_layers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
