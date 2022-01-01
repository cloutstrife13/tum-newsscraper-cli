import { MonthDictionary, LanguageCode } from '../types/dateTypes'

const namedMonthsDictionary: MonthDictionary[] = [
  { en: 'january', pl: 'stycznia', de: 'januar' },
  { en: 'february', pl: 'lutego', de: 'februar' },
  { en: 'march', pl: 'marca', de: 'märz' },
  { en: 'april', pl: 'kwietnia', de: 'april' },
  { en: 'may', pl: 'maja', de: 'mai' },
  { en: 'june', pl: 'czerwca', de: 'juni' },
  { en: 'july', pl: 'lipca', de: 'juli' },
  { en: 'august', pl: 'sierpnia', de: 'august' },
  { en: 'september', pl: 'września', de: 'september' },
  { en: 'october', pl: 'października', de: 'oktober' },
  { en: 'november', pl: 'listopada', de: 'november' },
  { en: 'december', pl: 'grudnia', de: 'dezember' },
]

const regexEuropeanFormat = /(0[1-9]|[12][0-9]|3[01]).(0[1-9]|1[0-2]).\d{4}/

const regexBritishFormat =
  /^([1][0-9](th)|[2]?(1st|2nd|3rd|[04-9]th)|[3](0th|1st)) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}/

const britishDaySuffixNotation = ['st', 'nd', 'rd', 'th']

export const getInconclusiveDate = () => new Date('0100')

export const getStartDateByYear = (year: string) => new Date(year)

export const getEndDateByYear = (year: string) => new Date(`${year}-12-31`)

export const isDateEuropeanFormat = (date: string) =>
  regexEuropeanFormat.test(date)

export const isDateBritishFormatWithDaySuffix = (date: string) =>
  regexBritishFormat.test(date)

export const isDateFormatMonthNameByLanguageCode = (
  date: string,
  languageCode: LanguageCode
) =>
  namedMonthsDictionary
    .map((month) => month[languageCode])
    .some((month) => date.toLowerCase().includes(month))

// only used within tests to ensure translation capability
export const getEnglishMonthNameByLanguageCode = (
  monthName: string,
  languageCode: LanguageCode
) =>
  namedMonthsDictionary.find((month) => month[languageCode] === monthName)?.en

export const extractDateByBritishFormat = (date: string) => {
  const dateFormatted = britishDaySuffixNotation
    .map((suffix) => {
      if (date.includes(suffix)) {
        return date.replace(suffix, '')
      }

      return null
    })
    .find((newDate) => newDate)

  if (dateFormatted) {
    return new Date(dateFormatted)
  }

  return getInconclusiveDate()
}

export const extractDateByEuropeanFormat = (date: string) => {
  const extracted = date.match(regexEuropeanFormat)

  if (!extracted) {
    return getInconclusiveDate()
  }

  const [extractedDate] = extracted

  const [day, month, year] = extractedDate.split('.')

  const dateUsFormatted = [month, day, year].join('/')

  return new Date(dateUsFormatted)
}

export const extractDateByMonthNameAndLanguageCode = (
  date: string,
  languageCode: LanguageCode
) => {
  const lowercasedDate = date.toLowerCase()
  const dateFormatted = namedMonthsDictionary
    .map((month) => {
      if (lowercasedDate.includes(month[languageCode])) {
        return lowercasedDate.replace(month[languageCode], month.en)
      }

      return null
    })
    .find((dateTranslated) => dateTranslated)

  if (dateFormatted) {
    return new Date(dateFormatted)
  }

  return getInconclusiveDate()
}

export const extractDateFromText = (date: string) => {
  if (isDateEuropeanFormat(date)) {
    return extractDateByEuropeanFormat(date)
  }

  if (isDateBritishFormatWithDaySuffix(date)) {
    return extractDateByBritishFormat(date)
  }

  if (isDateFormatMonthNameByLanguageCode(date, 'pl')) {
    return extractDateByMonthNameAndLanguageCode(date, 'pl')
  }

  if (isDateFormatMonthNameByLanguageCode(date, 'de')) {
    return extractDateByMonthNameAndLanguageCode(date, 'de')
  }

  return new Date(date)
}
