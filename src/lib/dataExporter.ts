import { prisma } from './prisma'
import { OptionsForExport } from '../types/commanderTypes'
import {
  generateOutputPathByDomain,
  makeDirectory,
  writeObjectToFile,
} from '../utils/systemManager'

export const actionForExport = (
  domains: string[],
  options: OptionsForExport
) => {
  domains.forEach(async (domain) => {
    const data = await prisma.newspaperArticle.findMany({
      where: {
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

    const path = generateOutputPathByDomain('exported', domain)

    makeDirectory(path)

    writeObjectToFile(`${path}/result.json`, data)
  })
}
