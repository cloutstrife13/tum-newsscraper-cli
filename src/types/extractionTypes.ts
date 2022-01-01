import { ArticleElement, NewspaperArticle } from '@prisma/client'
import { OptionsForScan } from './commanderTypes'

export type UrlDateParsed = {
  id: string
  url: string
  publication: Date
}

export type DateExtractionConfig = OptionsForScan

export type ErrorWithArticle = { error: string; article: NewspaperArticle }

export type ErrorWithSnapshot = { error: string; article: SnapshotArticleRef }

export type SnapshotArticleRef = { path: string; url: string; id: string }

export type DomainArticleSelector = {
  domain: string
  articles: SnapshotArticleRef[]
  selectors: ArticleElement[]
}
