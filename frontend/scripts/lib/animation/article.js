import { qs, qsa } from '@fluorescent/dom'
import delayOffset from '@/scripts/lib/animation/delay-offset'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'

const selectors = {
  articleHeading: `
    .article__image-container,
    .article__header-inner > *
  `,
  articleContent: '.article-content__wrapper',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [selectors.articleHeading, selectors.articleContent])

  const articleHeading = qsa(selectors.articleHeading, node)
  const articleContent = qs(selectors.articleContent, node)
  const observers = articleHeading.map((item) => intersectionWatcher(item))
  if (articleContent) {
    observers.push(intersectionWatcher(articleContent))
  }

  return {
    destroy() {
      observers.forEach((observer) => observer.destroy())
    },
  }
}
