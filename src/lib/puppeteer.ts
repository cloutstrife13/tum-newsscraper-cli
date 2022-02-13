/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { ArticleElement, NewspaperArticle } from '@prisma/client'
import puppeteer, { Page } from 'puppeteer'
import { writeFileSync } from 'fs'

import {
  generateOutputPathByDomain,
  makeDirectory,
} from '../utils/systemManager'
import {
  getAllCategoryArticles,
  getAllSitemapArticleUrls,
  getAllSitemapFragmentUrls,
} from './extractors'
import { WithSitemapConfig, WoSitemapConfig } from '../types/configTypes'
import { ProgressSpinner } from '../utils/progressSpinner'
import {
  DateExtractionConfig,
  ErrorWithArticle,
  ErrorWithSnapshot,
  SnapshotArticleRef,
  UrlDateParsed,
} from '../types/extractionTypes'
import {
  checkForConfigProperties,
  // checkRandomSampleCondition,
  // isErrorWithArticleEmpty,
} from '../utils/validator'
import { extractDateFromText } from '../utils/dateParser'
import { partition, shuffle } from '../utils/array'
// import { extractRetryableUrlsFromErrors } from '../utils/error'
// import {
//   getArticlesForRetry,
//   getConfigWithNewRandomSample,
// } from '../utils/sampleHelper'
import { getScannedArticlesByYearFilter } from '../utils/filter'
import { OptionsForScan } from '../types/commanderTypes'
import { Label } from '../utils/enums'
import {
  bodyExtractionLabels,
  multiTextLabels,
  singleTextLabels,
} from '../utils/label'
import {
  scrapeBodyContentFromArticle,
  scrapeImageUrlFromArticle,
  scrapeImageUrlsFromArticle,
  scrapeLinkUrlsFromArticle,
  scrapeTextFromArticle,
  scrapeTextsAndJoinFromArticle,
  scrapeTextsFromArticle,
  unnestBodyByTextNodes,
} from '../utils/puppeteerEvaluator'
import {
  LabelledScrapedContent,
  QuerySelectorAllEvaluator,
  QuerySelectorEvaluator,
  ScrapeConfiguration,
  ScrapedContent,
  ScrapeFunction,
  TextWithFontWeight,
  ScrapedArticle,
} from '../types/scrape'
import { QuerySelectorError } from '../utils/errors/querySelector'
import { getCustomExtractorByDomain } from './customScraper'
import { prisma } from './prisma'
import { reportError } from '../utils/error'

const getPuppeteerEngine = async <T>(
  extractionCallback: Function
): Promise<T[]> =>
  (async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    const result = await extractionCallback(page)

    await browser.close()

    return result
  })()

const navigateToPage = async (page: Page, url: string) =>
  Promise.all([
    page.goto(url, {
      waitUntil: 'networkidle2',
    }),
    page.waitForNavigation(),
  ])

const safeQuerySelectorEngine = async (
  page: Page,
  selector: string,
  evaluator: ScrapeFunction,
  isMulti = false
): Promise<ScrapedContent | null> => {
  try {
    const result = !isMulti
      ? await page.$eval(selector, evaluator as QuerySelectorEvaluator)
      : await page.$$eval(selector, evaluator as QuerySelectorAllEvaluator)

    return result
  } catch {
    return null
  }
}

const extractTextFromPage = async (page: Page, selector: string) => {
  const extractedText = await safeQuerySelectorEngine(
    page,
    selector,
    (node: Element) => node?.textContent
  )

  if (!extractedText) {
    throw new QuerySelectorError()
  }

  return extractedText as string
}

const getCallbackForQuerySelector = (label: string): ScrapeConfiguration => {
  if (singleTextLabels.includes(label)) {
    return [scrapeTextFromArticle, false]
  }

  if (label === Label.Summary) {
    return [scrapeTextsAndJoinFromArticle, true]
  }

  if (label === Label.Thumbnail) {
    return [scrapeImageUrlFromArticle, false]
  }

  if (multiTextLabels.includes(label)) {
    return [scrapeTextsFromArticle, true]
  }

  if (label === Label.Images) {
    return [scrapeImageUrlsFromArticle, true]
  }

  if (label === Label.Links) {
    return [scrapeLinkUrlsFromArticle, true]
  }

  return null
}

const scrapeContentFromArticle = async (
  page: Page,
  { selector, label }: ArticleElement
): Promise<ScrapedContent> => {
  const querySelectorParameter = getCallbackForQuerySelector(label)

  if (!querySelectorParameter) {
    return null
  }

  const [evaluator, isMulti] = querySelectorParameter

  return safeQuerySelectorEngine(page, selector, evaluator, isMulti)
}

const removeElementsByExclusion = async (
  page: Page,
  exclusions: ArticleElement[]
) => {
  const exclusionSelectors = ['script', 'ins']

  if (exclusions.length > 0) {
    exclusionSelectors.push(...exclusions.map(({ selector }) => selector))
  }

  return Promise.all(
    exclusionSelectors.map(async (selector) => {
      await safeQuerySelectorEngine(
        page,
        selector,
        (nodes: Element[]) => nodes.forEach((node) => node.remove()),
        true
      )
    })
  )
}

const flattenBodyNodesByTextNodes = async (
  page: Page,
  selector: string
): Promise<void> => {
  await safeQuerySelectorEngine(page, selector, unnestBodyByTextNodes)
}

const scrapeBodyFromArticle = async (
  page: Page,
  label: string,
  scrapeElements: ArticleElement[],
  domain: string
): Promise<LabelledScrapedContent[]> => {
  const [bodyElement, exclusions] = partition(
    scrapeElements,
    ({ label: elementLabel }) => !elementLabel.includes(Label.BodyExclusion)
  )

  await removeElementsByExclusion(page, exclusions)

  const [{ selector }] = bodyElement

  const extractor = getCustomExtractorByDomain(domain)

  const evaluateResult = async () =>
    (await safeQuerySelectorEngine(
      page,
      selector,
      scrapeBodyContentFromArticle
    )) as TextWithFontWeight[]

  if (!extractor) {
    const result = await evaluateResult()

    return [{ label, content: result.map(({ text }) => text).join(' ') }]
  }

  const [customExtractor, isUnnestor] = extractor

  if (isUnnestor) {
    await flattenBodyNodesByTextNodes(page, selector)
  }

  const result = await evaluateResult()

  return customExtractor(result)
}

export const extractUrlsFromSitemapPages = async ({
  sitemap,
  navSelector,
  navFragment,
}: WithSitemapConfig): Promise<string[]> =>
  getPuppeteerEngine(async (page: Page) => {
    await page.goto(sitemap)

    const urls = await getAllSitemapFragmentUrls(page, navSelector, navFragment)

    return getAllSitemapArticleUrls(page, urls, navSelector)
  })

export const extractUrlsFromSitemapPageslessPages = async (
  noSitemapDomain: WoSitemapConfig
): Promise<string[]> =>
  getPuppeteerEngine(async (page: Page) =>
    getAllCategoryArticles(page, noSitemapDomain)
  )

export const crawlArticlesForPublicationDates = async (
  domain: string,
  articles: NewspaperArticle[],
  dateSelector: string,
  spinner: ProgressSpinner,
  config?: DateExtractionConfig
): Promise<UrlDateParsed[]> =>
  getPuppeteerEngine(async (page: Page) => {
    let articlesCrawled = 0

    const errorArticles: ErrorWithArticle[] = []
    const publicationDatesByUrl: UrlDateParsed[] = []

    const [isRandomSample, isYearFilter] = checkForConfigProperties(config)

    for (const article of isRandomSample ? shuffle(articles) : articles) {
      try {
        await navigateToPage(page, article.url)

        /**
         publicationDatesByUrl.push({
          id: article.id,
          url: article.url,
          publication: extractDateFromText(
            await extractTextFromPage(page, dateSelector)
          ),
        })
         */

        const publication = extractDateFromText(
          await extractTextFromPage(page, dateSelector)
        )

        await prisma.newspaperArticle.update({
          where: {
            id: article.id,
          },
          data: {
            url: article.url,
            publication,
          },
        })
      } catch (e) {
        if (e instanceof Error) {
          errorArticles.push({
            error: e.name,
            article,
          })
        }
      }

      articlesCrawled += 1

      spinner.updateProgress(
        domain,
        isYearFilter && isRandomSample
          ? getScannedArticlesByYearFilter(publicationDatesByUrl, config!)
              .length
          : articlesCrawled
      )

      if (spinner.checkDomainTarget(domain)) {
        break
      }

      if (config?.crawlDelay) {
        await page.waitForTimeout(config.crawlDelay)
      }
    }

    if (errorArticles.length > 0) {
      reportError(errorArticles, domain)
    }

    /**
     * const retryableErrors = extractRetryableUrlsFromErrors(
      errorArticles,
      domain
    )

    const isRetryRequired = !(
      spinner.checkDomainTarget(domain) &&
      isErrorWithArticleEmpty(retryableErrors.length)
    )

    if (isRetryRequired) {
      spinner.setStatus(domain, 'Reattempting scan for timed out pages')

      spinner.updateProgress(domain, -retryableErrors.length)

      publicationDatesByUrl.push(
        ...(await crawlArticlesForPublicationDates(
          domain,
          retryableErrors,
          dateSelector,
          spinner
        ))
      )
    }

    if (!isRandomSample) {
      spinner.setStatus(domain, 'Completed')

      return publicationDatesByUrl
    }

    const filteredArticle = isYearFilter
      ? getScannedArticlesByYearFilter(publicationDatesByUrl, config!)
      : publicationDatesByUrl

    const isRandomSampleComplete = checkRandomSampleCondition(
      filteredArticle.length,
      config!.randomSample!,
      articles.length,
      articlesCrawled
    )

    if (!isRandomSampleComplete) {
      spinner.setStatus(
        domain,
        'Reattempting scan for completing random sample'
      )

      spinner.updateProgress(
        domain,
        filteredArticle.length - config!.randomSample!
      )

      publicationDatesByUrl.push(
        ...(await crawlArticlesForPublicationDates(
          domain,
          getArticlesForRetry(articles, publicationDatesByUrl),
          dateSelector,
          spinner,
          config
        ))
      )
    }
     */

    spinner.setStatus(domain, 'Completed')

    return publicationDatesByUrl
  })

export const saveArticleAsMhtml = (
  articles: NewspaperArticle[],
  domain: string,
  spinner: ProgressSpinner,
  { crawlDelay }: OptionsForScan
) =>
  (async () => {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()

    const path = generateOutputPathByDomain('snapshots', domain)

    makeDirectory(path)

    const errorArticles = []

    for (const article of articles) {
      try {
        await navigateToPage(page, article.url)

        const cdp = await page.target().createCDPSession()

        const { data } = await cdp.send('Page.captureSnapshot', {
          format: 'mhtml',
        })

        writeFileSync(`${path}/article-${article.id}.mhtml`, data)
      } catch {
        errorArticles.push(article)
      }

      spinner.updateProgress(domain)

      if (crawlDelay) {
        await page.waitForTimeout(crawlDelay)
      }
    }

    spinner.setStatus(domain, 'Completed')

    await browser.close()

    /**
    const areAllSnapshotsGenerated = errorArticles.length > 0

    spinner.setStatus(
      domain,
      areAllSnapshotsGenerated
        ? 'Retrying snapshot generation for failed pages'
        : 'Article snapshots successfully generated'
    )

    if (areAllSnapshotsGenerated) {
      saveArticleAsMhtml(errorArticles, domain, spinner, { crawlDelay })
    }
     */
  })()

export const crawlAndScrapeSnapshots = async (
  domain: string,
  articles: SnapshotArticleRef[],
  elements: ArticleElement[],
  spinner: ProgressSpinner
): Promise<ScrapedArticle[]> =>
  getPuppeteerEngine(async (page: Page) => {
    const scraped: ScrapedArticle[] = []

    const errorArticles: ErrorWithSnapshot[] = []

    const [extractionElements, bodyElements] = partition(
      elements,
      ({ label }) => !bodyExtractionLabels.includes(label)
    )

    for (const article of articles) {
      const scrapedFromPage: LabelledScrapedContent[] = []

      try {
        await navigateToPage(page, article.path)

        const extractedContent: LabelledScrapedContent[] = await Promise.all(
          extractionElements.map(async (element) => ({
            label: element.label,
            content: await scrapeContentFromArticle(page, element),
          }))
        )

        const [{ label }] = bodyElements.filter(
          ({ label: bodyLabel }) => bodyLabel === Label.Body
        )

        const processedContent = await scrapeBodyFromArticle(
          page,
          label,
          bodyElements,
          domain
        )

        scrapedFromPage.push(...extractedContent, ...processedContent)
      } catch (e) {
        if (e instanceof Error) {
          errorArticles.push({
            error: e.name,
            article,
          })
        }
      }

      scraped.push({
        id: article.id,
        url: article.url,
        data: scrapedFromPage,
      })

      spinner.updateProgress(domain)
    }

    /**
     if (errorArticles.length > 0) {
      spinner.setStatus(domain, 'Reattempting scrape for failed pages')

      spinner.updateProgress(domain, -errorArticles.length)

      scraped.push(
        ...(await crawlAndScrapeSnapshots(
          domain,
          errorArticles.map(({ article }) => article),
          elements,
          spinner
        ))
      )
    }
     */

    spinner.setStatus(domain, 'Completed')

    return scraped
  })
