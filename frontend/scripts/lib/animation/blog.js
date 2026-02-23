import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  headerItems: '.animation--blog-header > *',
  articleItem: '.article-item',
  pagination: '.blog__pagination',
}

export default (node) => {
  delayOffset(node, [
    selectors.headerItems,
    selectors.articleItem,
    selectors.pagination,
  ])

  const observer = intersectionWatcher(node, true)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
