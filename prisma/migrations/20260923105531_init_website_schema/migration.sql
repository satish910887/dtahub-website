-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteApp" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "longDesc" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "screenshots" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "sizeMb" DOUBLE PRECISION NOT NULL,
    "apkUrl" TEXT NOT NULL,
    "apkPublicId" TEXT,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "features" TEXT NOT NULL,
    "changelog" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'Android',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppDownload" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppDownload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteApp_slug_key" ON "WebsiteApp"("slug");

-- AddForeignKey
ALTER TABLE "AppDownload" ADD CONSTRAINT "AppDownload_appId_fkey" FOREIGN KEY ("appId") REFERENCES "WebsiteApp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
