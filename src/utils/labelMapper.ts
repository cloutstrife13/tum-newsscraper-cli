import {
  ExtractableLabel,
  LabelDictionary,
  ScrapedArticleConverged,
} from '../types/label'
import {
  FormattedScrapedArticle,
  FormattedScrapedContent,
} from '../types/scrape'
import { Label } from './enums'

const labelToPropertyMap: LabelDictionary = {
  [Label.Author]: 'author',
  [Label.Heading]: 'heading',
  [Label.Thumbnail]: 'thumbnailUrl',
  [Label.Standfirst]: 'standfirst',
  [Label.PubDate]: 'datePublished',
  [Label.Body]: 'body',
  [Label.Images]: 'imageUrls',
  [Label.Links]: 'referenceUrls',
  [Label.Categories]: 'categories',
  [Label.Tags]: 'tags',
  [Label.Summary]: 'summary',
  [Label.Subheading]: 'subheading',
}

const replaceLabelsWithPropertyNames = (scraped: FormattedScrapedContent[]) =>
  scraped
    .filter(({ content }) => content)
    .map(({ label, content }) => ({
      [`${labelToPropertyMap[label as ExtractableLabel]}`]: content,
    }))
    .reduce((prev, acc) => ({
      ...prev,
      ...acc,
    }))

export const convertScrapedDataArrayToObject = (
  scraped: FormattedScrapedArticle[]
): ScrapedArticleConverged[] =>
  scraped.map(({ id, data }) => ({
    newspaperArticleId: id,
    ...replaceLabelsWithPropertyNames(data),
  }))
