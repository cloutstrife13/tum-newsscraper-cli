import { getEndDateByYear, getStartDateByYear } from './dateParser'
import { validateNumericText, validateYearText } from './validator'

export const parseYearStart = (year: string) => {
  validateYearText(year)

  return getStartDateByYear(year)
}

export const parseYearEnd = (year: string) => {
  validateYearText(year)

  return getEndDateByYear(year)
}

export const parseSecondsToMs = (seconds: string) => {
  validateNumericText(seconds)

  return Number(seconds) * 1000
}
