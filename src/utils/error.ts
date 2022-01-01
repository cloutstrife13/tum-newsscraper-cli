import { ErrorWithArticle } from '../types/extractionTypes'
import { partition } from './array'
import {
  generateOutputPathByDomain,
  writeObjectToFile,
  makeDirectory,
  generateLocaleTimestamp,
} from './systemManager'
import { ErrorName } from './enums'

export const reportError = (qsErrors: ErrorWithArticle[], domain: string) => {
  const path = generateOutputPathByDomain('errors', domain)

  makeDirectory(path)

  writeObjectToFile(`${path}/${generateLocaleTimestamp()}-error.json`, qsErrors)
}

export const extractRetryableUrlsFromErrors = (
  errorArticles: ErrorWithArticle[],
  domain: string
) => {
  const [qsErrors, otherErrors] = partition(
    errorArticles,
    (el) => el.error === ErrorName.QuerySelector
  )

  if (qsErrors.length > 0) {
    reportError(qsErrors, domain)
  }

  return otherErrors.map(({ article }) => article)
}
