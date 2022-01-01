import { InvalidArgumentError } from 'commander'
import { DateExtractionConfig } from '../types/extractionTypes'

export const isPublicationDateInFilter = (
  publicationDate: Date,
  { yearStart, yearEnd }: DateExtractionConfig
) => {
  if (yearStart && !yearEnd && publicationDate >= yearStart) {
    return true
  }

  if (yearEnd && !yearStart && publicationDate <= yearEnd) {
    return true
  }

  if (
    yearStart &&
    yearEnd &&
    publicationDate >= yearStart &&
    publicationDate <= yearEnd
  ) {
    return true
  }

  return false
}

export const validateYearText = (year: string) => {
  if (Number.isNaN(Date.parse(year))) {
    throw new InvalidArgumentError('Not a year.')
  }
}

export const validateNumericText = (number: string) => {
  if (Number.isNaN(Number(number))) {
    throw new InvalidArgumentError('Not a number.')
  }
}

export const isErrorWithArticleEmpty = (errorCount: number) => errorCount === 0

const isExtractedEqualToRandomSample = (
  extractedCount: number,
  randomSample: number
) => extractedCount === randomSample

const isRandomSampleUnreachable = (
  totalCount: number,
  randomSample: number,
  allArticles: number,
  crawled: number
) => totalCount < randomSample && crawled === allArticles

export const checkRandomSampleCondition = (
  extractedCount: number,
  randomSample: number,
  allArticles: number,
  crawled: number
) => {
  if (isExtractedEqualToRandomSample(extractedCount, randomSample)) {
    return true
  }

  if (
    isRandomSampleUnreachable(
      extractedCount,
      randomSample,
      allArticles,
      crawled
    )
  ) {
    return true
  }

  return false
}

const checkIfRandomSampleExists = (config: DateExtractionConfig) =>
  Boolean(config.randomSample)

const checkIfYearFilterExists = (config: DateExtractionConfig) =>
  Boolean(config.yearStart || config.yearEnd)

export const checkForConfigProperties = (config?: DateExtractionConfig) =>
  !config
    ? [false, false]
    : [checkIfRandomSampleExists(config), checkIfYearFilterExists(config)]
