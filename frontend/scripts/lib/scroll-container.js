import { qsa, qs, listen, add } from '@fluorescent/dom'

const selectors = {
  sentinal: '.scroll-sentinal',
  scrollButtons: '.scroll-button',
  scrollViewport: '[data-scroll-container-viewport]',
}

const scrollContainer = (node) => {
  const sentinals = qsa(selectors.sentinal, node)
  const buttons = qsa(selectors.scrollButtons, node)
  const { axis, startAtEnd } = node.dataset
  const scrollAttribute = axis == 'vertical' ? 'scrollTop' : 'scrollLeft'
  const scrollerViewport = qs(selectors.scrollViewport, node)

  window.addEventListener(
    'load',
    () => {
      add(node, 'scroll-container-initialized')

      if (startAtEnd === 'true') {
        _startAtEnd()
      }
    },
    { once: true },
  )

  const events = [
    listen(buttons, 'click', (e) => {
      const button = e.currentTarget
      const scrollAttribute = axis == 'vertical' ? 'scrollTop' : 'scrollLeft'
      const scrollOffset = 100
      if (button.dataset.position === 'start') {
        if (scrollerViewport[scrollAttribute] < scrollOffset * 1.5) {
          scrollerViewport[scrollAttribute] = 0
        } else {
          scrollerViewport[scrollAttribute] -= scrollOffset
        }
      } else {
        scrollerViewport[scrollAttribute] += scrollOffset
      }
    }),
  ]

  const ioOptions = {
    root: scrollerViewport,
  }

  const intersectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      const position = entry.target.dataset.position
      const visible = entry.isIntersecting

      node.setAttribute(`data-at-${position}`, visible ? 'true' : 'false')
    })
  }, ioOptions)

  sentinals.forEach((sentinal) => {
    intersectionObserver.observe(sentinal)
  })

  const scrollTo = (element) => {
    const scrollDistance =
      axis == 'vertical'
        ? element.offsetTop - element.getBoundingClientRect().height
        : element.offsetLeft - element.getBoundingClientRect().width

    scrollerViewport[scrollAttribute] = scrollDistance
  }

  const unload = () => {
    sentinals.forEach((sentinal) => {
      intersectionObserver.unobserve(sentinal)
    })
    events.forEach((unsubscribe) => unsubscribe())
  }

  function _startAtEnd() {
    const scrollAttribute = axis == 'vertical' ? 'scrollTop' : 'scrollLeft'
    const scrollDirection = axis == 'vertical' ? 'scrollHeight' : 'scrollWidth'
    scrollerViewport[scrollAttribute] = scrollerViewport[scrollDirection] * 2
    node.dataset.startAtEnd = false
  }

  return { scrollTo, unload }
}

export default scrollContainer
