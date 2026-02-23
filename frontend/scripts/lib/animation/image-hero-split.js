import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  textContent: '.image-hero-split-item__text-container-inner > *',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [selectors.textContent], 1)
}
