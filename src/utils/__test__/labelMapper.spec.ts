import { formatDatesForScrapedArticles } from '../dateParser'
import { convertScrapedDataArrayToObject } from '../labelMapper'
import {
  mockDataLabelMapperOne,
  mockDataLabelMapperThree,
  mockDataLabelMapperTwo,
} from './mock/labelMapper.mock'

describe('Converge a list of label fragments into a single object', () => {
  it('should map properties without null values', () => {
    const [res] = convertScrapedDataArrayToObject(
      formatDatesForScrapedArticles(mockDataLabelMapperOne)
    )

    expect(Object.keys(res)).toEqual(
      expect.arrayContaining([
        'author',
        'standfirst',
        'tags',
        'categories',
        'datePublished',
        'heading',
        'thumbnailUrl',
        'referenceUrls',
        'body',
      ])
    )
  })

  it('should map all properties', () => {
    const [res] = convertScrapedDataArrayToObject(
      formatDatesForScrapedArticles(mockDataLabelMapperTwo)
    )

    expect(Object.keys(res)).toEqual(
      expect.arrayContaining([
        'imageUrls',
        'author',
        'standfirst',
        'tags',
        'categories',
        'datePublished',
        'heading',
        'thumbnailUrl',
        'referenceUrls',
        'body',
      ])
    )
  })

  it('should map all properties with special label', () => {
    const [res] = convertScrapedDataArrayToObject(
      formatDatesForScrapedArticles(mockDataLabelMapperThree)
    )

    expect(Object.keys(res)).toEqual(
      expect.arrayContaining([
        'summary',
        'author',
        'categories',
        'datePublished',
        'heading',
        'thumbnailUrl',
        'referenceUrls',
        'body',
      ])
    )
  })
})
