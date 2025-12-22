/*
  Warnings:

  - A unique constraint covering the columns `[deviceId]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "sessions_deviceId_key" ON "sessions"("deviceId");
