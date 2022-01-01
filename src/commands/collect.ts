import { Command } from 'commander'
import { actionForCollect } from '../lib/urlCollector'

import { argumentForDomains } from '../utils/commanderParameter'

export const commandForPullingUrlsFromDomain = new Command('collect')
  .description('Record all URLs of all newspaper articles by domain')
  .addArgument(argumentForDomains)
  .option('-o, --output', 'Print the result to the terminal')
  .action(actionForCollect)
