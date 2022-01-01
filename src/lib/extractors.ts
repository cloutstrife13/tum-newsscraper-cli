/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer'
import { WoSitemapConfig } from '../types/configTypes'

export const getAllSitemapFragmentUrls = async (
  page: Page,
  selector: string,
  urlMatcher: string
) =>
  page.evaluate(
    (css, matcher) => {
      const nodes = document.querySelectorAll(css)

      return [...nodes]
        .map((n) => n.textContent as string)
        .filter((t) => t.includes(matcher))
    },
    selector,
    urlMatcher
  )

export const getAllSitemapArticleUrls = async (
  page: Page,
  urls: string[],
  selector: string
) => {
  const articles = []

  for (const url of urls) {
    await page.goto(url)

    const articleUrls = await page.evaluate((css) => {
      const nodes = document.querySelectorAll(css)
      return [...nodes].map((n) => n.textContent as string)
    }, selector)

    articles.push(...articleUrls)
  }

  return articles
}

const getAllUrlsFromCategoryPage = async (
  page: Page,
  noSitemapDomain: WoSitemapConfig
) =>
  page.evaluate((siteConfig: WoSitemapConfig) => {
    const urlNodes = document.querySelectorAll(siteConfig.hrefSelector)
    return [...urlNodes].map((url) => url.getAttribute('href'))
    // const urls = [...urlNodes].map((el) => el.origin + el.pathname)

    // const dateNodes = document.querySelectorAll(siteConfig.dateSelector)
    // const years = [...dateNodes].map((date) =>
    //   Number(
    //     date.textContent
    //       ?.split(siteConfig.dateSplitter)
    //       .at(siteConfig.indexOfYear)
    //   )
    // )

    // const urlsUntil2015 = urls
    //   .map((url, index) => {
    //     if (years[index] > 2014) {
    //       return url
    //     }

    //     return null
    //   })
    //   .filter((url) => url)

    // return urlsUntil2015
  }, noSitemapDomain)

const getUrlsAndMaxPageCountFromFirstCategoryPage = async (
  page: Page,
  noSitemapDomain: WoSitemapConfig
) =>
  page.evaluate((siteConfig: WoSitemapConfig) => {
    const pagination = document.querySelector(siteConfig.paginationSelector)

    const maxPage =
      Number(
        pagination?.textContent?.split(siteConfig.paginationSplitter).at(-1)
      ) ?? 1

    const urlNodes = document.querySelectorAll(siteConfig.hrefSelector)
    const urls = [...urlNodes].map((url) => url.getAttribute('href'))

    const dateNodes = document.querySelectorAll(siteConfig.dateSelector)
    const years = [...dateNodes].map((date) =>
      Number(
        date.textContent
          ?.split(siteConfig.dateSplitter)
          .at(siteConfig.indexOfYear)
      )
    )

    const urlsUntil2015 = urls.map((url, index) => {
      if (years[index] > 2014) {
        return url
      }

      return null
    })

    return { maxPage, urls: urlsUntil2015 }
  }, noSitemapDomain)

export const getAllCategoryArticles = async (
  page: Page,
  noSitemapDomain: WoSitemapConfig
) => {
  const articles = []

  for (const category of noSitemapDomain.categories) {
    await page.goto(`${noSitemapDomain.categoryUrl}/${category}`)

    const { maxPage, urls } = await getUrlsAndMaxPageCountFromFirstCategoryPage(
      page,
      noSitemapDomain
    )

    articles.push(...(urls as string[]))

    if (maxPage > 1) {
      for (let i = 2; i < maxPage + 1; i++) {
        await page.goto(
          `${noSitemapDomain.categoryUrl}/${category}/page/${i.toString()}`
        )

        const urlsAfterPageOne = await getAllUrlsFromCategoryPage(
          page,
          noSitemapDomain
        )

        articles.push(...(urlsAfterPageOne as string[]))
      }
    }
  }

  return articles
}
