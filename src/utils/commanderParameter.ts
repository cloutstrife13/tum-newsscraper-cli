import { Argument, Option } from 'commander'
import { parseSecondsToMs, parseYearEnd, parseYearStart } from './inputParser'

export const argumentForDomains = new Argument(
  '<domains...>',
  'list of newspaper domains'
)

export const optionForRandomSample = new Option(
  '-r, --random-sample <randomSample>',
  'number of random articles to be processed'
).argParser(parseInt)

export const optionForStartYearFilter = new Option(
  '-s, --year-start <yearStart>',
  'takes articles with publication >= start year'
).argParser(parseYearStart)

export const optionForEndYearFilter = new Option(
  '-e, --year-end <yearEnd>',
  'takes articles with publication <= end year'
).argParser(parseYearEnd)

export const optionForCrawlDelay = new Option(
  '-d, --crawl-delay <crawlDelay>',
  'delay in seconds prior to page transition'
).argParser(parseSecondsToMs)

export const optionForFolderPath = new Option(
  '-p, --folder-path <folderPath>',
  'path to the work directory for dumping data'
).argParser(parseInt)

export const optionForArticleUrls = new Option(
  '-u, --article-urls <articleUrls>',
  'path to JSON file containing article urls'
)

export const optionForPageElements = new Option(
  '-e, --page-elements <pageElements>',
  'path to JSON file containing CSS selectors'
)

export const optionForExtractedData = new Option(
  '-x, --extracted-data <extractedData>',
  'path to JSON file containing scraped data'
)
