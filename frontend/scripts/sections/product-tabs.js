import section from '@/scripts/glow/section'
import { listen, qsa, qs } from '@fluorescent/dom'
import accordions from '@/scripts/lib/accordions'
import animateProductTabs from '@/scripts/lib/animation/product-tabs'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  tabLabels: '[data-tab-label]',
  tabItems: '[data-tab-item]',
  tabList: '[data-tab-list]',
  activeTabItem: "[data-tab-item][aria-hidden='false']",
}

section('product-tabs', {
  onLoad() {
    this.accordions = []
    this.tabItems = qsa(selectors.tabItems, this.container)
    this.tabLabels = qsa(selectors.tabLabels, this.container)
    this.tabList = qs(selectors.tabList, this.container)

    this.activeTabItem = qs(selectors.activeTabItem, this.container)
    if (this.activeTabItem) {
      this._setTabHeight(this.activeTabItem)
    }

    this.clickHandlers = listen(this.tabLabels, 'click', (e) => {
      e.preventDefault()

      const contentID = e.currentTarget.getAttribute('aria-controls')
      const content = qs(`#${contentID}`, this.container)
      this._closeAll()
      this._open(e.currentTarget, content)
    })

    const accordionElements = qsa('.accordion', this.container)
    accordionElements.forEach((accordion) => {
      const accordionOpen = accordion.classList.contains('accordion--open')
      this.accordions.push(accordions(accordion, { firstOpen: accordionOpen }))
      accordion.classList.add('rte--product', 'accordion--product')
    })

    if (shouldAnimate(this.container)) {
      this.animateProductTabs = animateProductTabs(this.container)
    }
  },

  _closeAll() {
    this.tabLabels.forEach((label) => {
      const contentID = label.getAttribute('aria-controls')
      const content = qs(`#${contentID}`, this.container)
      if (this._isVisible(content)) {
        this._close(label, content)
      }
    })
  },

  _open(label, content) {
    label.setAttribute('aria-expanded', true)
    content.setAttribute('aria-hidden', false)
    this._setTabHeight(content)
  },

  _close(label, content) {
    label.setAttribute('aria-expanded', false)
    content.setAttribute('aria-hidden', true)
  },

  _isVisible(content) {
    return content.getAttribute('aria-hidden') === 'false'
  },

  _setTabHeight(content) {
    const height = content.offsetHeight
    this.tabList.style.height = `${height}px`
  },

  onBlockSelect({ target }) {
    const contentID = target.getAttribute('aria-controls')
    const content = qs(`#${contentID}`, this.container)

    this._closeAll()
    this._open(target, content)
  },

  onUnload() {
    this.clickHandlers()
    this.accordions.forEach((accordion) => accordion.unload())
    this.animateProductTabs?.destroy()
  },
})
