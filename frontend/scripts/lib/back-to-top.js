import { qs, toggle } from '@fluorescent/dom'
import debounce from '@/scripts/utils/debounce'

// detect support for the behavior property in ScrollOptions
const supportsNativeSmoothScroll =
  'scrollBehavior' in document.documentElement.style

const backToTop = () => {
  const node = qs('[data-back-to-top]')
  if (!node) return

  // Handling button visibility
  const pageHeight = window.innerHeight
  let isVisible = false

  const backToTopDebounce = debounce()

  // Whatch scroll updates, we don't need precision here so we're debouncing
  window.addEventListener('scroll', () => backToTopDebounce(_scrollHandler))
  window.addEventListener('resize', () => backToTopDebounce(_scrollHandler))
  _scrollHandler()

  function _scrollHandler(y) {
    // Check if the button visibility should be toggled
    if (
      (window.scrollY > pageHeight && !isVisible) ||
      (window.scrollY < pageHeight && isVisible)
    ) {
      _toggleVisibility()
    }
  }

  function _toggleVisibility() {
    toggle(node, 'visible')
    isVisible = !isVisible
  }

  // Handling button clicks
  const button = qs('[data-back-to-top-button]', node)

  button.addEventListener('click', _buttonClick)

  function _buttonClick() {
    if (supportsNativeSmoothScroll) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    } else {
      window.scrollTo(0, 0)
    }
  }
}

export default backToTop
