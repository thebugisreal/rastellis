import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  content: '.quote__item-inner > *',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [selectors.content])
}
