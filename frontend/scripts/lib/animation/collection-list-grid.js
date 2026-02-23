import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  productItems: '.animation--item',
  introductionItems: '.animation--section-introduction > *',
}

export default (node) => {
  delayOffset(node, [selectors.introductionItems, selectors.productItems])
  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
