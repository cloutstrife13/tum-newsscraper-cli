import { readFileSync } from 'fs'
import { join } from 'path'
import {
  NewspaperConfig,
  PageElement,
  WithSitemapConfig,
  WoSitemapConfig,
} from '../types/configTypes'

const readObjectFromFile = (filePath: string) =>
  JSON.parse(
    readFileSync(join(__dirname, filePath), {
      encoding: 'utf-8',
    })
  )

export const getNewspaperConfig = (): NewspaperConfig[] =>
  readObjectFromFile('../data/newspapers.json')

export const getSitemapConfig = (): WithSitemapConfig[] =>
  readObjectFromFile('../data/withSitemaps.json')

export const getSitemaplessConfig = (): WoSitemapConfig[] =>
  readObjectFromFile('../data/withoutSitemaps.json')

export const getArticleElementsConfig = (): PageElement[] =>
  readObjectFromFile('../data/articleElements.json')
