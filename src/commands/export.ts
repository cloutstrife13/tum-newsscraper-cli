import { Command } from 'commander'
import { actionForExport } from '../lib/dataExporter'
import {
  argumentForDomains,
  optionForEndYearFilter,
  optionForRandomSample,
  optionForStartYearFilter,
} from '../utils/commanderParameter'

export const commandForExportingData = new Command('export')
  .description('Export newspaper-related data by domain')
  .addArgument(argumentForDomains)
  .addOption(optionForRandomSample)
  .addOption(optionForStartYearFilter)
  .addOption(optionForEndYearFilter)
  .action(actionForExport)
