export default function getMediaQuery(querySize) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    `--media-${querySize}`,
  )

  if (!value) {
    console.warn('Invalid querySize passed to getMediaQuery')
    return false
  }

  return value
}
