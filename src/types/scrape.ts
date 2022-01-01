import { Label } from '../utils/enums'

export type ScrapeFunction = QuerySelectorEvaluator | QuerySelectorAllEvaluator

export type ScrapedContent =
  | string
  | (string | null)[]
  | TextWithFontWeight
  | TextWithFontWeight[]
  | null
  | void

export type QuerySelectorEvaluator = (element: Element) => ScrapedContent

export type QuerySelectorAllEvaluator = (elements: Element[]) => ScrapedContent

export type ScrapeConfiguration = [ScrapeFunction, boolean] | null

export type LabelledScrapedContent = {
  label: string
  content: ScrapedContent
}

export type FormattedScrapedContent = {
  label: string
  content: ScrapedContent | Date
}

export type ScrapedArticle = {
  id: string
  url: string
  data: LabelledScrapedContent[]
}

export type FormattedScrapedArticle = {
  id: string
  url: string
  data: FormattedScrapedContent[]
}

export type BodyExtractionTuple = [
  {
    label: Label.Body
    selector: string
  },
  {
    label: Label.BodyExclusion
    selector: string
  }?
]

export type TextWithFontWeight = {
  text: string
  fontWeight: number
  bodyChildTagName: string
  bodyChildIndex: number
}

export type DomainExtractionFunction = (
  extractedContent: TextWithFontWeight[]
) => LabelledScrapedContent[]
