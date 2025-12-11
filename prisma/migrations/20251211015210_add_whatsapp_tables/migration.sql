-- CreateTable
CREATE TABLE `whatsapp_instances` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `instanceName` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'close',
    `state` VARCHAR(191) NOT NULL DEFAULT 'DISCONNECTED',
    `qrCode` LONGTEXT NULL,
    `webhookUrl` VARCHAR(191) NULL,
    `lastConnectedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `whatsapp_instances_instanceName_key`(`instanceName`),
    INDEX `whatsapp_instances_userId_idx`(`userId`),
    INDEX `whatsapp_instances_instanceName_idx`(`instanceName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `whatsapp_message_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `instanceId` VARCHAR(191) NOT NULL,
    `remoteJid` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `direction` VARCHAR(191) NOT NULL DEFAULT 'sent',
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `mediaUrl` VARCHAR(191) NULL,
    `error` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `whatsapp_message_logs_messageId_key`(`messageId`),
    INDEX `whatsapp_message_logs_userId_idx`(`userId`),
    INDEX `whatsapp_message_logs_instanceId_idx`(`instanceId`),
    INDEX `whatsapp_message_logs_messageId_idx`(`messageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `whatsapp_instances` ADD CONSTRAINT `whatsapp_instances_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `whatsapp_message_logs` ADD CONSTRAINT `whatsapp_message_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `whatsapp_message_logs` ADD CONSTRAINT `whatsapp_message_logs_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `whatsapp_instances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
