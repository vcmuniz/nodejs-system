-- AlterTable
ALTER TABLE `products` 
ADD COLUMN `type` ENUM('PHYSICAL', 'SERVICE', 'COURSE', 'DIGITAL', 'SUBSCRIPTION', 'EVENT') NOT NULL DEFAULT 'PHYSICAL',
ADD COLUMN `images` JSON NULL,
ADD COLUMN `metadata` JSON NULL,
ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX `products_type_idx` ON `products`(`type`);

-- CreateTable
CREATE TABLE `ProductPhysical` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `sku` VARCHAR(191) NULL,
    `weight` DOUBLE NULL,
    `width` DOUBLE NULL,
    `height` DOUBLE NULL,
    `depth` DOUBLE NULL,
    `variations` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductPhysical_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductService` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `duration` INTEGER NULL,
    `scheduling` BOOLEAN NOT NULL DEFAULT false,
    `location` VARCHAR(191) NULL,
    `professionals` JSON NULL,
    `extras` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductService_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductCourse` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(191) NULL,
    `modules` INTEGER NULL,
    `lessons` INTEGER NULL,
    `durationHours` INTEGER NULL,
    `certificate` BOOLEAN NOT NULL DEFAULT false,
    `accessDays` INTEGER NULL,
    `level` VARCHAR(191) NULL,
    `content` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductCourse_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductDigital` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NULL,
    `fileSize` INTEGER NULL,
    `fileType` VARCHAR(191) NULL,
    `downloadLimit` INTEGER NULL,
    `licenseType` VARCHAR(191) NULL,
    `expirationDays` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductDigital_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductSubscription` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `billingCycle` VARCHAR(191) NULL,
    `trialDays` INTEGER NULL,
    `maxUsers` INTEGER NULL DEFAULT 1,
    `benefits` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductSubscription_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductEvent` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `eventDate` DATETIME(3) NULL,
    `location` VARCHAR(191) NULL,
    `capacity` INTEGER NULL,
    `ticketsSold` INTEGER NOT NULL DEFAULT 0,
    `category` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductEvent_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductPhysical` ADD CONSTRAINT `ProductPhysical_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductService` ADD CONSTRAINT `ProductService_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductCourse` ADD CONSTRAINT `ProductCourse_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductDigital` ADD CONSTRAINT `ProductDigital_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSubscription` ADD CONSTRAINT `ProductSubscription_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductEvent` ADD CONSTRAINT `ProductEvent_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
