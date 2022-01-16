import { OptionsForExport } from '../types/commanderTypes'
import { DomainArticleSelector } from '../types/extractionTypes'
import {
  generateOutputPathByDomain,
  getAllFileNamesFromFolder,
  verifyPathExistence,
} from '../utils/systemManager'
import { prisma } from './prisma'

const getArticleIdsOfAllSnapshots = (snapshotPath: string) => {
  if (!verifyPathExistence(snapshotPath)) {
    return []
  }

  return getAllFileNamesFromFolder(snapshotPath).map((fileName: string) => {
    const pattern = 'article-'
    return fileName
      .substring(fileName.indexOf(pattern))
      .replace(pattern, '')
      .replace('.mhtml', '')
  })
}

export const getUrlsOfArticlesWithoutSnapshots = async (
  domains: string[],
  options?: OptionsForExport
) =>
  Promise.all(
    domains.map(async (domain) => {
      const snapshotIds = getArticleIdsOfAllSnapshots(
        generateOutputPathByDomain('snapshots', domain)
      )

      const articles = await prisma.newspaperArticle.findMany({
        where: {
          id: {
            notIn: snapshotIds,
          },
          newspaper: {
            name: domain,
          },
          publication: {
            gte: options?.yearStart,
            lte: options?.yearEnd,
          },
        },
        take: options?.randomSample,
      })

      return {
        domain,
        articles,
      }
    })
  )

export const getUnscrapedSnapshotsAndCssSelectors = async (
  domains: string[],
  options?: OptionsForExport
): Promise<DomainArticleSelector[]> =>
  Promise.all(
    domains.map(async (domain) => {
      const snapshotPath = generateOutputPathByDomain('snapshots', domain)
      const snapshotIds = getArticleIdsOfAllSnapshots(snapshotPath)

      const articles = (
        await prisma.newspaperArticle.findMany({
          where: {
            id: {
              in: snapshotIds,
            },
            newspaper: {
              name: domain,
            },
            publication: {
              gte: options?.yearStart,
              lte: options?.yearEnd,
            },
            scrapedArticle: {
              none: {},
            },
          },
          take: options?.randomSample,
        })
      ).map(({ url, id }) => ({
        url,
        id,
        path: `file://${snapshotPath}/article-${id}.mhtml`,
      }))

      const selectors = await prisma.articleElement.findMany({
        where: {
          newspaper: {
            name: domain,
          },
        },
      })

      return {
        domain,
        articles,
        selectors,
      }
    })
  )
