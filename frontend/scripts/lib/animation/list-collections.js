import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  heading: '.list-collections__heading',
  productItems: '.animation--item',
}

export default (node) => {
  delayOffset(node, [selectors.heading, selectors.productItems])
  const observer = intersectionWatcher(node, true)

  return {
    destroy() {
      observer.destroy()
    },
  }
}
