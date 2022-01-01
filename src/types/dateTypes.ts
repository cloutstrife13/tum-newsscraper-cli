export type EnglishMonth =
  | 'january'
  | 'february'
  | 'march'
  | 'april'
  | 'may'
  | 'june'
  | 'july'
  | 'august'
  | 'september'
  | 'october'
  | 'november'
  | 'december'

export type PolishMonth =
  | 'stycznia'
  | 'lutego'
  | 'marca'
  | 'kwietnia'
  | 'maja'
  | 'czerwca'
  | 'lipca'
  | 'sierpnia'
  | 'września'
  | 'października'
  | 'listopada'
  | 'grudnia'

export type GermanMonth =
  | 'januar'
  | 'februar'
  | 'märz'
  | 'april'
  | 'mai'
  | 'juni'
  | 'juli'
  | 'august'
  | 'september'
  | 'oktober'
  | 'november'
  | 'dezember'

export type MonthDictionary = {
  en: EnglishMonth
  pl: PolishMonth
  de: GermanMonth
}

export type LanguageCode = 'pl' | 'de'
