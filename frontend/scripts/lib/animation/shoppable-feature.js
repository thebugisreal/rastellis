import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  introductionItems: '.section-introduction > *',
  carousel:
    '.shoppable-feature__secondary-content .shoppable-feature__carousel-outer',
  hotspots: '.shoppable-item__hotspot-wrapper',
  mobileDrawerItems:
    '.animation--shoppable-feature-mobile-drawer  .shoppable-feature__carousel-outer > *:not(.swiper-pagination)',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [selectors.introductionItems, selectors.carousel], 1)
  delayOffset(node, [selectors.hotspots], 1)
  // Add separate delay offsets for mobile drawer
  delayOffset(node, [selectors.mobileDrawerItems], 1)

  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer.destroy()
    },
  }
}
