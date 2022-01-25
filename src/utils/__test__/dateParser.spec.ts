import { GermanMonth, PolishMonth } from '../../types/dateTypes'
import {
  extractDateFromText,
  getEnglishMonthNameByLanguageCode,
  getEndDateByYear,
  getStartDateByYear,
} from '../dateParser'
import { isPublicationDateInFilter } from '../validator'
import {
  englishMonthNames,
  germanMonthNames,
  polishMonthNames,
} from './mock/dateParser.mock'

describe('Translating foreign months to English', () => {
  it('Polish to English', () => {
    const result = polishMonthNames.map((polishMonth) =>
      getEnglishMonthNameByLanguageCode(polishMonth as PolishMonth, 'pl')
    )

    expect(result).toEqual(expect.arrayContaining(englishMonthNames))
  })

  it('German to English', () => {
    const result = germanMonthNames.map((germanMonth) =>
      getEnglishMonthNameByLanguageCode(germanMonth as GermanMonth, 'de')
    )

    expect(result).toEqual(expect.arrayContaining(englishMonthNames))
  })
})

describe('Get date from JavaScript compliant formats', () => {
  it('lgbtqnation.com', () => {
    // source: https://www.lgbtqnation.com/2016/02/trans-history-101-transgender-expression-in-ancient-times/
    const date = 'Wednesday, February 24, 2016'
    const expected = new Date('02/24/2016')
    const result = extractDateFromText(date)

    expect(result).toStrictEqual(expected)
  })

  it('codziennikfeministyczny.pl', () => {
    // source: http://codziennikfeministyczny.pl/rok-po-teczowej-nocy-kolektyw-szpila-publikuje-wstrzasajacy-raport-ujawniajacy-brutalna-przemoc-policji/
    const date = '2021-08-07'
    const expected = new Date('08/07/2021')
    const result = extractDateFromText(date)

    expect(result).toStrictEqual(expected)
  })

  it('gal-dem.com', () => {
    // source: https://gal-dem.com/anna-fearon-the-muse-random-acts-black-queer-beautiful/
    const date = '23 Oct 2019        '
    const expected = new Date('10/23/2019')
    const result = extractDateFromText(date)

    expect(result).toStrictEqual(expected)
  })
})

describe('Get date from articles with non-English month names', () => {
  it('maenner.media', () => {
    // source: https://www.maenner.media/gesellschaft/community/live-stream-gedenken-opfer-nationalsozialismus/
    const date = '26. Januar 2021'
    const expected = new Date('01/26/2021')
    const result = extractDateFromText(date)

    expect(result).toStrictEqual(expected)
  })

  it('jewish.org.pl 1', () => {
    // source: https://jewish.org.pl/wiadomosci/nowy-zarzad-zwiazku-gmin-wyznaniowych-zydowskich-w-rp/
    const date = '8 października 2021'
    const expected = new Date('10/08/2021')
    const result = extractDateFromText(date)

    expect(result).toStrictEqual(expected)
  })

  it('jewish.org.pl 2', () => {
    // source: https://jewish.org.pl/wiadomosci/bedzie-muzeum-getta-warszawskiego/
    const date = '14 listopada 2017'
    const expected = new Date('11/14/2017')
    const result = extractDateFromText(date)

    expect(result).toStrictEqual(expected)
  })

  it('jewish.org.pl 3', () => {
    // source: https://jewish.org.pl/wiadomosci/nowe-wystawy-muzeum-auschwitz-w-google-cultural-institute-6888/
    const date = '29 stycznia 2015'
    const expected = new Date('01/29/2015')
    const result = extractDateFromText(date)

    expect(result).toStrictEqual(expected)
  })
})

describe('Get date from articles with British day suffix', () => {
  it('muslimnews.co.uk', () => {
    // source: https://muslimnews.co.uk/news/palestine/palestine-israeli-army-detains-15-palestinians/
    const date = '7th Jul 2015'
    const expected = new Date('07/07/2015')
    const result = extractDateFromText(date)

    expect(result).toStrictEqual(expected)
  })
})

describe('Get date from articles with European dotted format', () => {
  it('polishexpress.co.uk', () => {
    // source: https://www.polishexpress.co.uk/parlamentarzystka-alarmuje-ze-wielu-imigrantow-z-bulgarii-a-takze-z-polski-pada-ofiara-krzywdzacej-oceny-i-pozbawia-sie-ich-zasilkow
    const date = '11.12.2021'
    const expected = new Date('12/11/2021')
    const result = extractDateFromText(date)

    expect(result).toStrictEqual(expected)
  })

  it('queer.pl', () => {
    // source: https://jewish.org.pl/wiadomosci/nowy-zarzad-zwiazku-gmin-wyznaniowych-zydowskich-w-rp/
    const date = ' Czwartek, 16.12.2021, Aktualizacja: Piątek, 17.12.2021 '
    const expected = new Date('12/16/2021')
    const result = extractDateFromText(date)

    expect(result).toStrictEqual(expected)
  })
})

describe('Check if publication date is within search filter', () => {
  it('should validate a date that is greater than the input', () => {
    const date = new Date('12/11/2019')

    const params = {
      yearStart: getStartDateByYear('2015'),
    }

    const res = isPublicationDateInFilter(date, params)

    expect(res).toBeTruthy()
  })

  it('should validate a date that is less than the input', () => {
    const date = new Date('12/11/2019')

    const params = {
      yearEnd: getEndDateByYear('2021'),
    }

    const res = isPublicationDateInFilter(date, params)

    expect(res).toBeTruthy()
  })

  it('should validate a date that is equal to the input', () => {
    const date = new Date('12/11/2019')

    const params = {
      yearStart: date,
      yearEnd: date,
    }

    const res = isPublicationDateInFilter(date, params)

    expect(res).toBeTruthy()
  })

  it('should validate a date that is within a date range', () => {
    const date = new Date('12/11/2019')

    const params = {
      yearStart: getStartDateByYear('2015'),
      yearEnd: getEndDateByYear('2021'),
    }

    const res = isPublicationDateInFilter(date, params)

    expect(res).toBeTruthy()
  })

  it('should invalidate a date that is less than the input', () => {
    const date = getStartDateByYear('2015')

    const params = {
      yearStart: new Date('12/11/2019'),
    }

    const res = isPublicationDateInFilter(date, params)

    expect(res).toBeFalsy()
  })

  it('should invalidate a date that is greater than the input', () => {
    const date = getEndDateByYear('2021')

    const params = {
      yearEnd: new Date('12/11/2019'),
    }

    const res = isPublicationDateInFilter(date, params)

    expect(res).toBeFalsy()
  })

  it('should invalidate a date that is not within a date range', () => {
    const date = getEndDateByYear('2014')

    const params = {
      yearStart: getStartDateByYear('2015'),
      yearEnd: getEndDateByYear('2021'),
    }

    const res = isPublicationDateInFilter(date, params)

    expect(res).toBeFalsy()
  })

  it('should be falsy if not inputs given', () => {
    const date = getEndDateByYear('2015')

    const params = {
      randomSample: 1000,
    }

    const res = isPublicationDateInFilter(date, params)

    expect(res).toBeFalsy()
  })
})
