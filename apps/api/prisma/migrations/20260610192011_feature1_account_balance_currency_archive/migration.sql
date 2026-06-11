-- AlterTable
ALTER TABLE "account" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BRL',
ADD COLUMN     "initialBalance" INTEGER NOT NULL DEFAULT 0;
