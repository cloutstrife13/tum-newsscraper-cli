export const shuffle = <T>(arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // eslint-disable-next-line no-param-reassign
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export const partition = <T>(
  arr: T[],
  predicate: (el: T) => boolean
): T[][] => {
  const truthies = arr.filter(predicate)
  const falsies = [arr, truthies].reduce((left, right) =>
    left.filter((el) => !right.includes(el))
  )

  return [truthies, falsies]
}

export const difference = <T>(
  arr1: T[],
  arr2: T[],
  predicate: (left: T, right: T) => boolean
): T[] => arr1.filter((left) => !arr2.some((right) => predicate(left, right)))
