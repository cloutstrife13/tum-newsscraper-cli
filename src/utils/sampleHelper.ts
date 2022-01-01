import { NewspaperArticle } from '@prisma/client'
import { difference, shuffle } from './array'
import { DateExtractionConfig, UrlDateParsed } from '../types/extractionTypes'

const getAllArticlesWoExtractedForRetry = (
  allArticles: NewspaperArticle[],
  extracted: NewspaperArticle[]
) =>
  shuffle(
    difference(
      allArticles,
      extracted,
      ({ url: lUrl }, { url: rUrl }) => lUrl === rUrl
    )
  )

export const getArticlesForRetry = (
  allArticles: NewspaperArticle[],
  extracted: UrlDateParsed[]
) =>
  getAllArticlesWoExtractedForRetry(
    allArticles,
    extracted.map((article) => ({
      ...article,
      newspaperId: -1,
    }))
  )

export const getConfigWithNewRandomSample = (
  extractedCount: number,
  config?: DateExtractionConfig
) =>
  config?.randomSample
    ? {
        ...config,
        randomSample: config.randomSample - extractedCount,
      }
    : config
