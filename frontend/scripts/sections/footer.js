import { listen, qsa, toggle } from '@fluorescent/dom'
import { slideDown, slideUp, slideStop, isVisible } from 'slide-anim'

import section from '@/scripts/glow/section'
import Disclosure from '@/scripts/lib/disclosure'

const selectors = {
  disclosure: '[data-disclosure]',
  header: '[data-header]',
}

section('footer', {
  crossBorder: {},

  onLoad() {
    const headers = qsa(selectors.header, this.container)

    this.headerClick = listen(headers, 'click', handleHeaderClick)

    function handleHeaderClick({ currentTarget }) {
      const { nextElementSibling: content } = currentTarget
      const willOpen = !isVisible(content)
      toggle(currentTarget, 'open', willOpen)
      currentTarget.setAttribute('aria-expanded', willOpen ? 'true' : 'false')
      slideStop(content)

      if (isVisible(content)) {
        slideUp(content)
      } else {
        slideDown(content)
      }
    }

    // Wire up Cross Border disclosures
    const cbSelectors = qsa(selectors.disclosure, this.container)

    if (cbSelectors) {
      cbSelectors.forEach((selector) => {
        const { disclosure: d } = selector.dataset
        this.crossBorder[d] = Disclosure(selector)
      })
    }
  },

  onUnload() {
    this.headerClick()
    Object.keys(this.crossBorder).forEach((t) => this.crossBorder[t].unload())
  },
})
