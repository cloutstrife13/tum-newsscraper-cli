import { Command } from 'commander'
import { actionForScrape } from '../lib/mhtmlScraper'
import {
  argumentForDomains,
  optionForEndYearFilter,
  optionForRandomSample,
  optionForStartYearFilter,
} from '../utils/commanderParameter'

export const commandForScrapingSnapshots = new Command('scrape')
  .description('Scrape MHTML documents for data from newspaper articles')
  .addArgument(argumentForDomains)
  .addOption(optionForRandomSample)
  .addOption(optionForStartYearFilter)
  .addOption(optionForEndYearFilter)
  .action(actionForScrape)
