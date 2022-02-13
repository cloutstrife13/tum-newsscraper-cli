import { getInconclusiveDate as generateDatelessMarker } from '../utils/dateParser'
import { OptionsForScan } from '../types/commanderTypes'
import { Label } from '../utils/enums'
// import {
//   generateOutputPathByDomain,
//   makeDirectory,
//   writeObjectToFile,
// } from '../utils/systemManager'
import { prisma } from './prisma'
import { crawlArticlesForPublicationDates } from './puppeteer'
import { ProgressSpinner } from '../utils/progressSpinner'

export const actionForScan = async (
  domains: string[],
  options: OptionsForScan
) => {
  const data = await Promise.all(
    domains.map(async (domain) => {
      const searchParam = {
        newspaper: {
          name: domain,
        },
      }

      const articles = await prisma.newspaperArticle.findMany({
        where: { ...searchParam, publication: generateDatelessMarker() },
      })

      const element = await prisma.articleElement.findFirst({
        where: {
          ...searchParam,
          label: Label.PubDate,
        },
      })

      return {
        domain,
        articles,
        target:
          options?.randomSample && articles.length > options.randomSample
            ? options.randomSample
            : articles.length,
        element,
      }
    })
  )

  const spinner = new ProgressSpinner(
    'Scanning articles for publication dates. Please wait...',
    data.map(({ domain, target }) => ({ domain, entries: target }))
  )

  spinner.startSpinner()

  await Promise.all(
    data.map(async ({ domain, articles, element }) =>
      crawlArticlesForPublicationDates(
        domain,
        articles,
        element?.selector!,
        spinner,
        options
      )
    )
  )

  /**
     await prisma.$transaction(
    result.flat().map(({ id, ...rest }) =>
      prisma.newspaperArticle.update({
        where: {
          id,
        },
        data: rest,
      })
    )
  )
   */

  spinner.endSpinner()
}
