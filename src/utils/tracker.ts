import {
  DomainEntryCount,
  DomainExtractionProgress,
} from '../types/statusTypes'

export const getDomainExtractionProgress = (
  domainsWithEntryCount: DomainEntryCount[]
): DomainExtractionProgress =>
  domainsWithEntryCount
    .map(({ domain, entries }) => ({
      [domain]: {
        current: 0,
        target: entries,
        status: '',
      },
    }))
    .reduce((cur, acc) => ({
      ...cur,
      ...acc,
    }))
