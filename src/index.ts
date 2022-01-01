import { Command } from 'commander'
import { commandForExportingData } from './commands/export'
import { commandForImportingData } from './commands/import'
import { commandForScanningArticleDates } from './commands/scan'
import { commandForGeneratingArticleSnapshots } from './commands/snapshot'
import { commandForScrapingSnapshots } from './commands/scrape'
import { commandForPullingUrlsFromDomain } from './commands/collect'
import { commandForInitialisation } from './commands/initialise'

const program = new Command()
program
  .version('1.0.0')
  .addCommand(commandForInitialisation)
  .addCommand(commandForPullingUrlsFromDomain)
  .addCommand(commandForScanningArticleDates)
  .addCommand(commandForGeneratingArticleSnapshots)
  .addCommand(commandForScrapingSnapshots)
  .addCommand(commandForImportingData)
  .addCommand(commandForExportingData)
  .parse(process.argv)
