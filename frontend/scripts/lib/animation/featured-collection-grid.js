import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  intro: '.animation--section-introduction > *',
  items: '.animation--item',
}

export default (node) => {
  delayOffset(node, [selectors.intro, selectors.items])

  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
