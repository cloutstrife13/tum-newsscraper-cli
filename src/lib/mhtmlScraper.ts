import { crawlAndScrapeSnapshots } from './puppeteer'
import { OptionsForExport } from '../types/commanderTypes'
import { ProgressSpinner } from '../utils/progressSpinner'
import { getUnscrapedSnapshotsAndCssSelectors } from './dataBridge'
import { prisma } from './prisma'
import { convertScrapedDataArrayToObject } from '../utils/labelMapper'
import { formatDatesForScrapedArticles } from '../utils/dateParser'
import { FormattedScrapedArticle } from '../types/scrape'

export const actionForScrape = async (
  domains: string[],
  options: OptionsForExport
) => {
  const data = await getUnscrapedSnapshotsAndCssSelectors(domains, options)

  const spinner = new ProgressSpinner(
    'Scraping data from articles. Please wait...',
    data.map(({ domain, articles }) => ({ domain, entries: articles.length }))
  )

  spinner.startSpinner()

  const scrapedArticles = (
    await Promise.all(
      data.map(({ domain, articles, selectors }) =>
        crawlAndScrapeSnapshots(domain, articles, selectors, spinner)
      )
    )
  ).flat()

  const scrapedArticlesFormatted: FormattedScrapedArticle[] =
    formatDatesForScrapedArticles(scrapedArticles)

  const scrapedArticlesConverged = convertScrapedDataArrayToObject(
    scrapedArticlesFormatted
  )

  await prisma.$transaction(
    scrapedArticlesConverged.map(
      ({ categories, tags, imageUrls, referenceUrls, ...rest }) =>
        prisma.scrapedArticle.create({
          data: {
            ...rest,
            categories: {
              createMany: {
                data:
                  categories?.map((category) => ({
                    name: category,
                  })) ?? [],
                skipDuplicates: true,
              },
            },
            tags: {
              createMany: {
                data:
                  tags?.map((tag) => ({
                    name: tag,
                  })) ?? [],
                skipDuplicates: true,
              },
            },
            imageUrls: {
              createMany: {
                data:
                  imageUrls?.map((url) => ({
                    url,
                  })) ?? [],
                skipDuplicates: true,
              },
            },
            referenceUrls: {
              createMany: {
                data:
                  referenceUrls?.map((url) => ({
                    url,
                  })) ?? [],
                skipDuplicates: true,
              },
            },
          },
        })
    )
  )

  spinner.endSpinner()
}
