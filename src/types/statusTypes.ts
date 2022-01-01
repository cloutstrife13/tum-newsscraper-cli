export type DomainExtractionProgress = {
  [domain: string]: {
    current: number
    target: number
    status: string
  }
}

export type DomainEntryCount = { domain: string; entries: number }
