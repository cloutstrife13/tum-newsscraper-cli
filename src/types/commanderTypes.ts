export type OptionsForExport = {
  randomSample?: number
  yearStart?: Date
  yearEnd?: Date
}

export type OptionsForScan = OptionsForExport & {
  crawlDelay?: number
}

export type OptionsForImport = {
  articleUrls?: string
  pageElements?: string
  extractedData?: string
}
