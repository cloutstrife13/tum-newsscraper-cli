import {
  DomainExtractionFunction,
  LabelledScrapedContent,
  TextWithFontWeight,
} from '../types/scrape'
import { Label } from '../utils/enums'
import {
  internationalSurnamePatterns,
  muslimNewsAuthorBottom,
  muslimNewsAuthorTopByName,
  muslimNewsPhotoCaption,
} from '../utils/regex'

const maennerMedia = (
  extractedContent: TextWithFontWeight[]
): LabelledScrapedContent[] => {
  if (extractedContent.length === 0) {
    return []
  }

  const [standfirst, ...body] = extractedContent.map(({ text }) => text)

  return [
    {
      label: Label.Standfirst,
      content: standfirst,
    },
    {
      label: Label.Body,
      content: body.length > 0 ? body.join(' ') : null,
    },
  ]
}

const checkIfTextBlockIsName = (text: string) => {
  const originalWords = text.replace(/\band\b/, '&').split(' ')
  const lowerCaseWords = originalWords.filter((word) => {
    if (internationalSurnamePatterns.test(word)) {
      return false
    }

    if (/^[a-z]/g.test(word.charAt(0))) {
      return true
    }

    return false
  })

  return lowerCaseWords.length === 0
}

const muslimNewsCoUk = (
  extractedContent: TextWithFontWeight[]
): LabelledScrapedContent[] => {
  if (extractedContent.length === 0) {
    return []
  }

  const extractedBodyText = extractedContent.map(({ text }) => text)

  const indicesToRemove: number[] = []
  const authors: string[] = []

  const authorStringSanitiser = (author: string) =>
    author
      .replace(muslimNewsAuthorTopByName, '')
      .replace(/\band\b/, ',')
      .replace('&', ',')
      .split(',')
      .map((text) => text.trim())

  let firstElementIdx = 0
  let firstElement = extractedBodyText[firstElementIdx]

  if (firstElement && muslimNewsPhotoCaption.test(firstElement)) {
    firstElementIdx++
    firstElement = extractedBodyText[firstElementIdx]
  }

  indicesToRemove.push(firstElementIdx)

  if (firstElement && checkIfTextBlockIsName(firstElement)) {
    authors.push(...authorStringSanitiser(firstElement))

    firstElementIdx++
    firstElement = extractedBodyText[firstElementIdx]
    indicesToRemove.push(firstElementIdx)
  }

  // if standfirst is bold in DOM but misses remaining text
  if (firstElement && /\(AA\):?$/g.test(firstElement)) {
    firstElementIdx++
    firstElement = [firstElement, extractedBodyText[firstElementIdx]].join(' ')
    indicesToRemove.push(firstElementIdx)
  }

  const authorBottomIdx = extractedBodyText.findIndex((text) =>
    muslimNewsAuthorBottom.test(text)
  )

  if (!(authorBottomIdx < 0)) {
    let authorBottom = extractedBodyText[authorBottomIdx]

    if (muslimNewsAuthorBottom.test(authorBottom!)) {
      authorBottom = authorBottom!.replace(muslimNewsAuthorBottom, '')
      indicesToRemove.push(authorBottomIdx)
    }

    if (authorBottom!.toLowerCase() === authorBottom!.toUpperCase()) {
      const authorNameIdx = authorBottomIdx + 1

      authorBottom = extractedBodyText[authorNameIdx]
      indicesToRemove.push(authorNameIdx)
    }

    // clean lower case characters after last upper case

    authors.push(...authorStringSanitiser(authorBottom!))
  }

  return [
    {
      label: Label.Author,
      content: authors.length > 0 ? authors.join(', ') : null,
    },
    {
      label: Label.Standfirst,
      content: firstElement ?? null,
    },
    {
      label: Label.Body,
      content:
        extractedBodyText.length > 0
          ? extractedBodyText
              .filter((_, index) => !indicesToRemove.includes(index))
              .join(' ')
          : null,
    },
  ]
}

const codziennikFeministycznyPl = (
  extractedContent: TextWithFontWeight[]
): LabelledScrapedContent[] => {
  if (extractedContent.length === 0) {
    return []
  }

  const uniqueIndices = [
    ...new Set(extractedContent.map(({ bodyChildIndex }) => bodyChildIndex)),
  ]

  const textNodesByBodyChild = uniqueIndices.map((index) =>
    extractedContent.filter(({ bodyChildIndex }) => index === bodyChildIndex)
  )

  const textNodesMerged = textNodesByBodyChild.map((node) => {
    const { bodyChildIndex, fontWeight } = node[0]
    const text = node.map(({ text: textFragment }) => textFragment).join(' ')

    return {
      text,
      bodyChildIndex,
      fontWeight,
    }
  })

  const isStandfirstBold =
    textNodesMerged[0]?.fontWeight > 599 && textNodesMerged[1]?.fontWeight > 599

  const bodyText = textNodesMerged
    .filter((_, index) => !(index === 0 || (isStandfirstBold && index === 1)))
    .map(({ text }) => text)
    .join(' ')

  return [
    {
      label: Label.Standfirst,
      content: isStandfirstBold
        ? [textNodesMerged[0]?.text, textNodesMerged[1]?.text].join(' ')
        : textNodesMerged[0]?.text,
    },
    {
      label: Label.Body,
      content: bodyText.length > 0 ? bodyText : null,
    },
  ]
}

export const getCustomExtractorByDomain = (
  domain: string
): [DomainExtractionFunction, boolean] | null => {
  switch (domain) {
    case 'maenner.media':
      return [maennerMedia, false]

    case 'muslimnews.co.uk':
      return [muslimNewsCoUk, false]

    case 'codziennikfeministyczny.pl':
      return [codziennikFeministycznyPl, true]

    default:
      return null
  }
}
