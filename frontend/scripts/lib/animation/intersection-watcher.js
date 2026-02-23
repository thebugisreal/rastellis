import { add } from '@fluorescent/dom'
import getMediaQuery from '@/scripts/lib/media-queries'

export default (node, instant = false) => {
  const margin = window.matchMedia(getMediaQuery('above-720')).matches
    ? 200
    : 100
  let threshold = 0
  if (!instant) {
    threshold = Math.min(margin / node.offsetHeight, 0.5)
  }

  const observer = new IntersectionObserver(
    ([{ isIntersecting: visible }]) => {
      if (visible) {
        add(node, 'is-visible')

        observer.disconnect()
      }
    },
    { threshold: threshold },
  )

  observer.observe(node)

  return {
    destroy() {
      observer?.disconnect()
    },
  }
}
