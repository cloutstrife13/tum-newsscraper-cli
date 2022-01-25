import { Label } from '../utils/enums'

export type ExtractableLabel = Exclude<Label, Label.BodyExclusion>

export type LabelDictionary = {
  [label in ExtractableLabel]: string
}

export type ScrapedArticleConverged = {
  author?: string
  heading?: string
  thumbnailUrl?: string
  standfirst?: string
  datePublished?: Date
  body?: string
  imageUrls?: string[]
  referenceUrls?: string[]
  categories?: string[]
  tags?: string[]
  summary?: string
  subheading?: string
  newspaperArticleId: string
}
