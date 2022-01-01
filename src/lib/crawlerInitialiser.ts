import { partition } from '../utils/array'
import {
  getArticleElementsConfig,
  getNewspaperConfig,
} from '../utils/fileReader'
import { prisma } from './prisma'

export const actionForInitialise = async () => {
  const newspaperDomains = getNewspaperConfig().map(({ domain }) => domain)

  await prisma.newspaper.createMany({
    data: newspaperDomains.map((domain) => ({
      name: domain,
    })),
    skipDuplicates: true,
  })

  const elements = getArticleElementsConfig()

  const newspapers = (await prisma.newspaper.findMany()).map(
    ({ name, id }) => ({ name, id })
  )

  const [valid] = partition(elements, ({ domain }) =>
    newspapers.map(({ name }) => name).includes(domain)
  )

  const elementsWithDomain = valid
    .map(({ domain, pageElements }) =>
      pageElements.map((el) => ({
        newspaperId: newspapers.find(({ name }) => name === domain)!.id,
        ...el,
      }))
    )
    .flat()

  await prisma.articleElement.createMany({
    data: elementsWithDomain,
  })
}
