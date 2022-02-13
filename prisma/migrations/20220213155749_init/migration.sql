-- CreateTable
CREATE TABLE `Config` (
    `outputDir` VARCHAR(256) NOT NULL,

    UNIQUE INDEX `Config_outputDir_key`(`outputDir`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Newspaper` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) NOT NULL,

    UNIQUE INDEX `Newspaper_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NewspaperArticle` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(512) NOT NULL,
    `newspaperId` INTEGER NOT NULL,
    `publication` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `NewspaperArticle_url_key`(`url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticleElement` (
    `id` VARCHAR(191) NOT NULL,
    `newspaperId` INTEGER NOT NULL,
    `selector` VARCHAR(256) NOT NULL,
    `label` VARCHAR(64) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScrapedArticle` (
    `id` VARCHAR(191) NOT NULL,
    `author` VARCHAR(128) NULL,
    `heading` VARCHAR(256) NULL,
    `thumbnailUrl` VARCHAR(512) NULL,
    `standfirst` TEXT NULL,
    `datePublished` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `body` TEXT NULL,
    `summary` TEXT NULL,
    `subheading` TEXT NULL,
    `newspaperArticleId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticleCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(512) NOT NULL,
    `scrapedArticleId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticleTag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(512) NOT NULL,
    `scrapedArticleId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticleImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(512) NOT NULL,
    `scrapedArticleId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticleLink` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(512) NOT NULL,
    `scrapedArticleId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NewspaperArticle` ADD CONSTRAINT `NewspaperArticle_newspaperId_fkey` FOREIGN KEY (`newspaperId`) REFERENCES `Newspaper`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleElement` ADD CONSTRAINT `ArticleElement_newspaperId_fkey` FOREIGN KEY (`newspaperId`) REFERENCES `Newspaper`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScrapedArticle` ADD CONSTRAINT `ScrapedArticle_newspaperArticleId_fkey` FOREIGN KEY (`newspaperArticleId`) REFERENCES `NewspaperArticle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleCategory` ADD CONSTRAINT `ArticleCategory_scrapedArticleId_fkey` FOREIGN KEY (`scrapedArticleId`) REFERENCES `ScrapedArticle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleTag` ADD CONSTRAINT `ArticleTag_scrapedArticleId_fkey` FOREIGN KEY (`scrapedArticleId`) REFERENCES `ScrapedArticle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleImage` ADD CONSTRAINT `ArticleImage_scrapedArticleId_fkey` FOREIGN KEY (`scrapedArticleId`) REFERENCES `ScrapedArticle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticleLink` ADD CONSTRAINT `ArticleLink_scrapedArticleId_fkey` FOREIGN KEY (`scrapedArticleId`) REFERENCES `ScrapedArticle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
