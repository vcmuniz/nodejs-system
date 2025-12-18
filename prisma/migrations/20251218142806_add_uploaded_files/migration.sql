-- CreateTable
CREATE TABLE `uploaded_files` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `businessProfileId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `uploaded_files_userId_idx`(`userId`),
    INDEX `uploaded_files_businessProfileId_idx`(`businessProfileId`),
    INDEX `uploaded_files_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `uploaded_files` ADD CONSTRAINT `uploaded_files_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `uploaded_files` ADD CONSTRAINT `uploaded_files_businessProfileId_fkey` FOREIGN KEY (`businessProfileId`) REFERENCES `business_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
