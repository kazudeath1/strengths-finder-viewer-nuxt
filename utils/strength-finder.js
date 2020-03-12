const STRENGTH_COUNT = 34
const pattern = [...Array(STRENGTH_COUNT).keys()]
  .map(i => ++i)
  .reduce((result, i) => {
    return result + i + '\\.\\s(\\S+)\\s'
  }, '^')

export const extractStrengths = text => {
  const regex = new RegExp(pattern, 'm')
  const match = regex.exec(text)
  if (!match) {
    return []
  }
  const strs = []
  for (let i = 1; i <= STRENGTH_COUNT; i++) {
    strs.push(match[i])
  }
  return strs
}
