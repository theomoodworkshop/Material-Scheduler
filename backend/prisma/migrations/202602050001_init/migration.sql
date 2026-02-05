-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "projectNumber" TEXT,
    "plannedStartDate" DATETIME,
    "plannedEndDate" DATETIME,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plannedStartDate" DATETIME,
    "plannedEndDate" DATETIME,
    CONSTRAINT "WorkOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialRequirement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" TEXT NOT NULL,
    "workOrderId" TEXT,
    "materialSku" TEXT NOT NULL,
    "materialName" TEXT,
    "quantityRequired" REAL NOT NULL,
    "unit" TEXT,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 14,
    "supplier" TEXT,
    "requiredOnDate" DATETIME,
    "recommendedOrderDate" DATETIME,
    "status" TEXT NOT NULL,
    "lastSyncedAt" DATETIME NOT NULL,
    CONSTRAINT "MaterialRequirement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaterialRequirement_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialLibrary" (
    "materialSku" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "defaultLeadTimeDays" INTEGER NOT NULL DEFAULT 14,
    "unit" TEXT,
    "supplier" TEXT
);

-- CreateTable
CREATE TABLE "SyncMeta" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "MaterialRequirement_projectId_idx" ON "MaterialRequirement"("projectId");
CREATE INDEX "MaterialRequirement_status_idx" ON "MaterialRequirement"("status");
CREATE INDEX "MaterialRequirement_recommendedOrderDate_idx" ON "MaterialRequirement"("recommendedOrderDate");
