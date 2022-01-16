import { Command } from 'commander'
import { actionForSnapshot } from '../lib/mhtmlSnapshotter'
import {
  argumentForDomains,
  optionForCrawlDelay,
  optionForEndYearFilter,
  optionForRandomSample,
  optionForStartYearFilter,
} from '../utils/commanderParameter'

export const commandForGeneratingArticleSnapshots = new Command('snapshot')
  .description('Generate MHTML documents by pulled URLs domain-wise')
  .addArgument(argumentForDomains)
  .addOption(optionForRandomSample)
  .addOption(optionForStartYearFilter)
  .addOption(optionForEndYearFilter)
  .addOption(optionForCrawlDelay)
  .action(actionForSnapshot)
