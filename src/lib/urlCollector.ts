import { WithSitemapConfig, WoSitemapConfig } from '../types/configTypes'
import { getInconclusiveDate as generateDatelessMarker } from '../utils/dateParser'
import {
  getNewspaperConfig,
  getSitemapConfig,
  getSitemaplessConfig,
} from '../utils/fileReader'
import {
  extractUrlsFromSitemapPages,
  extractUrlsFromSitemapPageslessPages,
} from './puppeteer'
import { prisma } from './prisma'
import { ProgressSpinner } from '../utils/progressSpinner'
import { partition } from '../utils/array'

export const pullUrlsByDomain = async (
  inputDomain: string,
  spinner: ProgressSpinner
) => {
  const newspapers = getNewspaperConfig()

  const newspaper = newspapers.find(({ domain }) => domain === inputDomain)

  if (!newspaper) {
    spinner.updateProgress(inputDomain)
    spinner.setStatus(
      inputDomain,
      'Newspaper not supported. Operation aborted.'
    )

    return []
  }

  const isUrlSourceSitemap = newspaper.urlSource === 'sitemap'

  const urlSourceNewspapers = isUrlSourceSitemap
    ? getSitemapConfig()
    : getSitemaplessConfig()

  const urlSourceNewspaper = [...urlSourceNewspapers].find(
    ({ domain }) => domain === inputDomain
  )

  if (!urlSourceNewspaper) {
    spinner.updateProgress(inputDomain)
    spinner.setStatus(
      inputDomain,
      'Newspaper not supported. Operation aborted.'
    )

    return []
  }

  const allUrls = isUrlSourceSitemap
    ? await extractUrlsFromSitemapPages(urlSourceNewspaper as WithSitemapConfig)
    : await extractUrlsFromSitemapPageslessPages(
        urlSourceNewspaper as WoSitemapConfig
      )

  spinner.updateProgress(inputDomain)
  spinner.setStatus(inputDomain, 'Completed')

  const allUrlsUnique = [...new Set(allUrls)]

  return allUrlsUnique
}

export const actionForCollect = async (
  domains: string[],
  { output }: { output: boolean }
) => {
  const newspapers = await prisma.newspaper.findMany()

  const [supportedDomains, unsupportedDomains] = partition(domains, (domain) =>
    newspapers.map(({ name }) => name).includes(domain)
  )

  if (supportedDomains.length > 0) {
    const spinner = new ProgressSpinner(
      'Pulling article URLs from newspaper domain. Please wait...',
      supportedDomains.map((domain) => ({ domain, entries: 1 }))
    )

    const noDateMarker = generateDatelessMarker()

    spinner.startSpinner()

    const urls = await Promise.all(
      supportedDomains.map(async (domain) => {
        const newspaperId = newspapers.find(({ name }) => domain === name)!.id
        const urlsFromSitemap = await pullUrlsByDomain(domain, spinner)

        return urlsFromSitemap.length > 0
          ? urlsFromSitemap.map((url) => ({
              newspaperId,
              url,
              publication: noDateMarker,
            }))
          : []
      })
    )

    spinner.endSpinner()

    await prisma.newspaperArticle.createMany({
      data: urls.flat(),
      skipDuplicates: true,
    })

    if (output) {
      console.log(JSON.stringify(urls, null, 2))
    }
  }

  if (unsupportedDomains.length > 0) {
    console.log(`Unsupported domains found:\n${unsupportedDomains.join('\n')}`)
  }
}
