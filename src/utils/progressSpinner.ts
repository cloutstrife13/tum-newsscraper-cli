import ora, { Ora } from 'ora-classic'
import {
  DomainEntryCount,
  DomainExtractionProgress,
} from '../types/statusTypes'
import { getDomainExtractionProgress } from './tracker'

export const getSpinner = (text: string) => ora(text)

export class ProgressSpinner {
  spinner: Ora

  domains: DomainExtractionProgress

  longestKey: number

  progressStatus: string

  constructor(text: string, domains: DomainEntryCount[]) {
    const domainExtractionProgress = getDomainExtractionProgress(domains)

    this.spinner = ora()
    this.domains = domainExtractionProgress
    this.longestKey = Math.max(
      ...Object.keys(domainExtractionProgress).map(({ length }) => length)
    )
    this.progressStatus = text
  }

  getProgressText() {
    return `${this.progressStatus}
    ${Object.entries(this.domains)
      .map(
        ([domain, { current, target, status }]) =>
          `\n  ${domain.padEnd(this.longestKey, ' ')} (${current}/${target}) ${
            status.length > 0 ? `// ${status}` : ''
          }`
      )
      .join('')}`
  }

  setStatus(domain: string, status: string) {
    this.domains[domain].status = status
  }

  startSpinner() {
    this.spinner.start(this.getProgressText())
  }

  checkDomainTarget(domain: string) {
    return this.domains[domain].current === this.domains[domain].target
  }

  updateProgress(domain: string, progress?: number) {
    if (!progress) {
      this.domains[domain].current++
    } else {
      this.domains[domain].current =
        progress < 0 ? this.domains[domain].current - progress * -1 : progress
    }

    this.spinner.text = this.getProgressText()
  }

  endSpinner() {
    this.spinner.succeed('Task completed')
  }
}
