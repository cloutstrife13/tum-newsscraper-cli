import { saveArticleAsMhtml } from './puppeteer'
import { OptionsForScan } from '../types/commanderTypes'
import { ProgressSpinner } from '../utils/progressSpinner'
import { getUrlsOfArticlesWithoutSnapshots } from './dataBridge'

export const actionForSnapshot = async (
  domains: string[],
  options: OptionsForScan
) => {
  const data = await getUrlsOfArticlesWithoutSnapshots(domains, options)

  const spinner = new ProgressSpinner(
    'Generating snapshot replicas from articles. Please wait...',
    data.map(({ domain, articles }) => ({ domain, entries: articles.length }))
  )

  spinner.startSpinner()

  await Promise.all(
    data.map(async ({ articles, domain }) =>
      saveArticleAsMhtml(articles, domain, spinner, options)
    )
  )

  spinner.endSpinner()
}
