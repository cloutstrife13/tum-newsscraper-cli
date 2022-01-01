import { TextWithFontWeight } from '../types/scrape'

export const scrapeTextFromArticle = (node: Element): string | null => {
  if (node && node.textContent) {
    return node.textContent.trim()
  }

  return null
}

export const scrapeTextsAndJoinFromArticle = (
  nodes: Element[]
): string | null =>
  nodes.length > 0
    ? [...nodes]
        .map(({ textContent }) => (textContent ? textContent.trim() : ''))
        .filter((text) => text.length > 0)
        .join(' ')
    : null

export const scrapeImageUrlFromArticle = (node: Element): string | null =>
  node ? (node as HTMLImageElement).src : null

export const scrapeTextsFromArticle = (
  nodes: Element[]
): (string | null)[] | null =>
  nodes.length > 0
    ? [...nodes]
        .map(({ textContent }) => (textContent ? textContent.trim() : ''))
        .filter((text) => text.length > 0)
    : null

export const scrapeImageUrlsFromArticle = (
  nodes: Element[]
): (string | null)[] | null =>
  nodes.length > 0
    ? [...nodes].map((node) => (node as HTMLImageElement).src)
    : null

export const scrapeLinkUrlsFromArticle = (
  nodes: Element[]
): (string | null)[] | null =>
  nodes.length > 0
    ? [...nodes].map((node) => (node as HTMLAnchorElement).href)
    : null

export const unnestBodyByTextNodes = (node: Element) => {
  const textNodeParentsExtracted = node.querySelectorAll('p,h5,h4,h3,h2,h1')

  const bodyChildNodes = [...node.children]
  bodyChildNodes.forEach((el) => el.remove())

  textNodeParentsExtracted.forEach((el) => node.appendChild(el))
}

export const scrapeBodyContentFromArticle = (
  node: Element
): TextWithFontWeight[] | null => {
  if (!node) {
    return []
  }

  const getSanitisedTextContent = (text: string | null) =>
    text
      ? text
          .replaceAll('\n', ' ')
          .replace(/\s\s+/g, ' ') // two or more whitespaces
          .replace(/[\u200B-\u200D\uFEFF]/g, '') // invisible characters
          .trim()
      : ''

  const getFontWeightOfTextByParent = (element: Element | null) =>
    element ? Number(window.getComputedStyle(element).fontWeight) : 0

  const findTextNodeRootFromParent = (
    element: Element | null
  ): Element | null => {
    const parentElement = element?.parentElement

    if (!parentElement) {
      return null
    }

    return parentElement.className === node.className
      ? element
      : findTextNodeRootFromParent(element.parentElement)
  }

  const getBodyChildTagNameAndIndex = (
    element: Element | null
  ): [string, number] =>
    !element
      ? ['unknown', -1]
      : [
          element.tagName.toLowerCase(),
          Array.prototype.indexOf.call(node.children, element),
        ]

  const getAllTextNodesFromBody = () => {
    const textNodes: Node[] = []
    const nodeIterator = document.createNodeIterator(node, NodeFilter.SHOW_TEXT)
    let currentTextNode: Node | null

    do {
      currentTextNode = nodeIterator.nextNode()

      if (currentTextNode) {
        textNodes.push(currentTextNode)
      }
    } while (currentTextNode)

    return textNodes
  }

  const textNodesExtracted = [...getAllTextNodesFromBody()]
    .map(({ textContent, parentElement }) => {
      const text = getSanitisedTextContent(textContent)

      const fontWeight = getFontWeightOfTextByParent(parentElement)

      const [bodyChildTagName, bodyChildIndex] = getBodyChildTagNameAndIndex(
        findTextNodeRootFromParent(parentElement)
      )

      return {
        text,
        fontWeight,
        bodyChildTagName,
        bodyChildIndex,
      }
    })
    .filter(({ text }) => text.length > 0)

  return textNodesExtracted
}
