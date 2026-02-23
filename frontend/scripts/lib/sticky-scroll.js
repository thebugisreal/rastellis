import lerp from '@/scripts/lib/animation/lerp'
import { qs, add, remove } from '@fluorescent/dom'
import provideResizeObserver from '@/scripts/utils/provide-resize-observer'

const selectors = {
  stickyContainer: '[data-sticky-container]',
  stickyFilterBar: '.filter-bar--sticky',
  root: ':root',
}

const classes = {
  hasSticky: 'has-sticky-scroll',
}

export default function (node) {
  const stickyContainer = qs(selectors.stickyContainer, node)

  if (!stickyContainer) return false

  let resizeObserver

  node.style.setProperty('--sticky-container-top', 0)

  // Init position vars

  let previousScrollY = window.scrollY // The previous scroll position of the page
  let currentScrollAmount = 0 // To keep track of the amount scrolled per event

  // Height of the header bar
  //  Used for calculating position
  //  Set in `_observeHeight()` when the `--header-desktop-sticky-height` var is set
  let headerHeight = 0

  // Height of the sticky filter bar
  //  Used for calculating position
  //  Set in `_observeHeight()` when the `--header-desktop-sticky-height` var is set
  let stickyFilterBarHeight = 0
  const stickyFilterBar = qs(selectors.stickyFilterBar)

  // Save the sticky filter bar height to a CSS variable
  const root = qs(selectors.root, document)
  root.style.setProperty('--sticky-filter-bar-height', '0px')

  let stickyContainerTop = headerHeight // The sticky container's `top` value
  let stickyContainerTopPrevious = stickyContainerTop

  // The height of the sticky container
  //  Gets updated by a resize observer on the window and sticky container
  let stickyContainerHeight = stickyContainer.offsetHeight

  // The height of the sticky container plus the height of the header
  let stickyContainerHeightWithHeaderAndBar =
    stickyContainerHeight + headerHeight

  // The max amount for the sticky container `top` value
  //  This is equal to the number of pixels that the sticky container extends the viewport by
  //  Gets updated by a resize observer on the window and sticky container
  let stickyContainerMaxTop =
    stickyContainerHeightWithHeaderAndBar - window.innerHeight

  // Watch scroll updates
  const scroller = () => {
    _scrollHandler(window.scrollY)

    // Update the sticky filter bar height CSS variable
    if (stickyFilterBar) stickyFilterBarHeight = stickyFilterBar.offsetHeight

    root.style.setProperty(
      '--sticky-filter-bar-height',
      `${stickyFilterBarHeight}px`,
    )
  }

  window.addEventListener('scroll', scroller)
  window.addEventListener('resize', scroller)

  // Resize observer on the window and the sticky container
  //  Container contents may expand with interaction
  provideResizeObserver().then(({ ResizeObserver }) => {
    if (resizeObserver) resizeObserver.disconnect()

    resizeObserver = new ResizeObserver(_observeHeight)

    resizeObserver.observe(stickyContainer)
    resizeObserver.observe(document.documentElement)
  })

  // Start the animation loop
  requestAnimationFrame(() => _updateStickyContainerTopLoop())

  function _observeHeight() {
    stickyContainerHeight = stickyContainer.offsetHeight
    if (stickyFilterBar) stickyFilterBarHeight = stickyFilterBar.offsetHeight

    headerHeight = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--header-desktop-sticky-height')
        .replace(/px/gi, ''),
    )

    stickyContainerHeightWithHeaderAndBar =
      stickyContainerHeight + headerHeight + stickyFilterBarHeight
    stickyContainerMaxTop =
      stickyContainerHeightWithHeaderAndBar - window.innerHeight

    // Check if the sticky container is taller than the viewport and the node container has room
    // for the sticky container to scroll.
    //  The sticky container could be taller than its sibling so it won't have room to scroll.
    if (
      stickyContainerHeightWithHeaderAndBar > window.innerHeight &&
      node.offsetHeight > stickyContainerHeightWithHeaderAndBar
    ) {
      add(node, classes.hasSticky)
      _scrollHandler(window.scrollY)
    } else {
      remove(node, classes.hasSticky)
    }
  }

  function _scrollHandler(y) {
    currentScrollAmount = previousScrollY - y

    // The offset based on how far the page has been scrolled from last event
    const currentScrollOffset = stickyContainerTop + currentScrollAmount

    const topMax = headerHeight + stickyFilterBarHeight // The max top value while scrolling up
    const bottomMax =
      -stickyContainerMaxTop + headerHeight + stickyFilterBarHeight - 40 // The max top value while scrolling down

    // Find the current top value
    //  Based on the currentScrollOffset value within the range of topMax and bottomMax
    stickyContainerTop = Math.max(
      bottomMax,
      Math.min(currentScrollOffset, topMax),
    )

    // Update the previous scroll position for next time.
    previousScrollY = y
  }

  // This is an endless RAF loop used to update the `--sticky-container-top` CSS var.
  //  We're using this with a LERP function to smooth out the position updating
  //  instead of having large jumps while scrolling fast.
  function _updateStickyContainerTopLoop() {
    // We want to continue to update `--sticky-container-top` until fully into the stopped position
    if (stickyContainerTop !== stickyContainerTopPrevious) {
      stickyContainerTopPrevious = lerp(
        stickyContainerTopPrevious,
        stickyContainerTop,
        0.5,
      )
      node.style.setProperty(
        '--sticky-container-top',
        `${stickyContainerTopPrevious}px`,
      )
    }

    requestAnimationFrame(() => _updateStickyContainerTopLoop())
  }

  function destroy() {
    window.removeEventListener('scroll', scroller)
    window.removeEventListener('resize', scroller)
    resizeObserver?.disconnect()
  }

  return { destroy }
}
