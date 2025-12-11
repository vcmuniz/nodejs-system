-- CreateTable
CREATE TABLE `scheduled_tasks` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `actionType` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `scheduledFor` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `result` JSON NULL,
    `error` VARCHAR(191) NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `maxRetries` INTEGER NOT NULL DEFAULT 3,
    `executedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `scheduled_tasks_userId_idx`(`userId`),
    INDEX `scheduled_tasks_scheduledFor_idx`(`scheduledFor`),
    INDEX `scheduled_tasks_status_idx`(`status`),
    INDEX `scheduled_tasks_actionType_idx`(`actionType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `scheduled_tasks` ADD CONSTRAINT `scheduled_tasks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
