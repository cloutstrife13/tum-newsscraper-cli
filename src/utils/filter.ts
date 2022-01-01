import { DateExtractionConfig, UrlDateParsed } from '../types/extractionTypes'
import { isPublicationDateInFilter } from './validator'

export const getScannedArticlesByYearFilter = (
  publicationDatesByUrl: UrlDateParsed[],
  config: DateExtractionConfig
) =>
  publicationDatesByUrl.filter(({ publication }) =>
    isPublicationDateInFilter(publication, config)
  )
