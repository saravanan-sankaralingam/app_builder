-- CreateEnum
CREATE TYPE "ComponentMethod" AS ENUM ('scratch', 'ai');

-- AlterTable
ALTER TABLE "components" ADD COLUMN     "method" "ComponentMethod" NOT NULL DEFAULT 'scratch',
ADD COLUMN     "prompt" TEXT;
