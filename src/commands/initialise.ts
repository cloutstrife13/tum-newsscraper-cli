import { Command } from 'commander'
import { actionForInitialise } from '../lib/crawlerInitialiser'

export const commandForInitialisation = new Command('initialise')
  .description('Initialise domain-specific configuration for web crawler')
  .action(actionForInitialise)
