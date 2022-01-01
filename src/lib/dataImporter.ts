import { NewspaperArticle } from '@prisma/client'
import { OptionsForImport } from '../types/commanderTypes'
import { partition } from '../utils/array'
import { readObjectFromFile } from '../utils/systemManager'
import { prisma } from './prisma'

const importUrlsToDb = async (pathToFile: string) => {
  const urls = readObjectFromFile<NewspaperArticle[]>(pathToFile)

  await prisma.newspaperArticle.createMany({
    data: urls,
    skipDuplicates: true,
  })
}

const importElementsToDb = async (pathToFile: string) => {
  const elements =
    readObjectFromFile<
      { domain: string; pageElements: { label: string; selector: string }[] }[]
    >(pathToFile)

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

export const actionForImport = async ({
  articleUrls,
  pageElements,
  extractedData,
}: OptionsForImport) => {
  if (articleUrls) {
    await importUrlsToDb(articleUrls)
  }

  if (pageElements) {
    await importElementsToDb(pageElements)
  }

  if (extractedData) {
    console.log('Not implemented yet')
  }
}
