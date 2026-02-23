import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  headerItems: '.animation--section-introduction > *',
  articleItem: '.article-item',
}

export default (node) => {
  delayOffset(node, [selectors.headerItems, selectors.articleItem])

  const observer = intersectionWatcher(node, true)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
