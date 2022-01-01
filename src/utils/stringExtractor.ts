export const extractIdFromFileName = (fileName: string) => {
  const pattern = 'article-'
  return fileName
    .substring(fileName.indexOf(pattern))
    .replace(pattern, '')
    .replace('.mhtml', '')
}
