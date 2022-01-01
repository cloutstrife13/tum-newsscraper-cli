import { Command } from 'commander'
import { actionForImport } from '../lib/dataImporter'
import {
  optionForArticleUrls,
  optionForExtractedData,
  optionForPageElements,
} from '../utils/commanderParameter'

export const commandForImportingData = new Command('import')
  .description('Import data such as scraped articles, urls, or page elements')
  .addOption(optionForArticleUrls)
  .addOption(optionForPageElements)
  .addOption(optionForExtractedData)
  .action(actionForImport)
