-- Manual migration for SharedContent table
-- Execute this SQL directly in your MySQL database

-- Create SharedContent table
CREATE TABLE IF NOT EXISTS `shared_content` (
  `id` VARCHAR(191) NOT NULL,
  `shareId` VARCHAR(191) NOT NULL,
  `contentType` ENUM('WORD_OF_DAY', 'PRAYER_REQUEST') NOT NULL,
  `contentId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `expiresAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE INDEX `shared_content_shareId_key` (`shareId`),
  INDEX `shared_content_userId_fkey` (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key constraint separately (safer approach)
ALTER TABLE `shared_content`
ADD CONSTRAINT `shared_content_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
ON DELETE SET NULL ON UPDATE CASCADE;
