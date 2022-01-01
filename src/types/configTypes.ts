export type NewspaperConfig = {
  domain: string
  urlSource: 'sitemap' | 'custom'
  remarks: string
}

export type WithSitemapConfig = {
  domain: string
  sitemap: string
  navFragment: string
  navSelector: string
  hasLastModified: boolean
  recordedOn: string
}

export type WoSitemapConfig = {
  domain: string
  categoryUrl: string
  categories: string[]
  paginationSplitter: string
  dateSplitter: string
  indexOfYear: number
  paginationSelector: string
  hrefSelector: string
  dateSelector: string
  recordedOn: string
}

export type PageElement = {
  domain: string
  pageElements: [
    {
      label: string
      selector: string
    }
  ]
}
