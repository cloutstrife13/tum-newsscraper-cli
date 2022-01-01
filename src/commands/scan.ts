import { Command } from 'commander'
import { actionForScan } from '../lib/dateScanner'

import {
  argumentForDomains,
  optionForCrawlDelay,
  optionForEndYearFilter,
  optionForRandomSample,
  optionForStartYearFilter,
} from '../utils/commanderParameter'

export const commandForScanningArticleDates = new Command('scan')
  .description('Crawl through every URL and record their publication dates')
  .addArgument(argumentForDomains)
  .addOption(optionForRandomSample)
  .addOption(optionForStartYearFilter)
  .addOption(optionForEndYearFilter)
  .addOption(optionForCrawlDelay)
  .action(actionForScan)
