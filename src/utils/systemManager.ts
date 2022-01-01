import { resolve } from 'path'
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

export const generateOutputPath = (folderName: string) =>
  resolve('out', folderName)

export const generateOutputPathByDomain = (
  folderName: string,
  domain: string
) => resolve('out', folderName, domain)

export const makeDirectory = (path: string) => {
  mkdirSync(path, { recursive: true })
}

export const generateLocaleTimestamp = () =>
  new Date()
    .toLocaleString()
    .replaceAll('/', '')
    .replaceAll(':', '')
    .replaceAll(', ', '-')

export const getAllFileNamesFromFolder = (folderPath: string) =>
  readdirSync(folderPath)

export const readObjectFromFile = <T>(filePath: string) =>
  JSON.parse(
    readFileSync(filePath, {
      encoding: 'utf-8',
    })
  ) as T

export const writeObjectToFile = (filePath: string, data: object) =>
  writeFileSync(filePath, JSON.stringify(data, null, 2))
