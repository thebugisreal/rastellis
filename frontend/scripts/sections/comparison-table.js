import { qs, qsa, add, remove } from '@fluorescent/dom'
import debounce from '@/scripts/utils/debounce'
import section from '@/scripts/glow/section'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import animateNewsletter from '@/scripts/lib/animation/newsletter'

const CENTER_CLASS = 'comparison-table__center'

section('comparison-table', {
  onLoad() {
    this.tableEl = qs('.js-comparison-table', this.container)
    this.scrollEl = qs('.js-comparison-scroll', this.container)
    this.contentEl = qs('.js-comparison-content', this.container)
    this.headerEl = qs('.js-comparison-header', this.container)
    const cellTopEls = qsa('.js-pc-cell-top', this.container)
    const resizeDebounce = debounce()

    if (cellTopEls && cellTopEls.length) {
      setTimeout(() => {
        this.setModuleCenter()
      }, 1000)

      window.addEventListener('resize', () => {
        resizeDebounce(() => this.setModuleCenter(), 500)
      })
    }

    let lastPos = 0
    this.scrollEl.addEventListener('scroll', () => {
      let currPos = this.scrollEl.scrollLeft
      if (lastPos < currPos) this.scrollRight()
      if (lastPos > currPos) this.scrollLeft()
      lastPos = currPos
    }, { passive: true })

    if (shouldAnimate(this.container)) {
      this.animateComparisonTable = animateNewsletter(this.container)
    }
  },

  setModuleCenter () {
    remove(this.tableEl, CENTER_CLASS)
    const scrollWidth = this.scrollEl.clientWidth
    const contentWidth = this.contentEl.scrollWidth

    if (contentWidth > scrollWidth) {
      remove(this.tableEl, CENTER_CLASS)
      add(this.tableEl, 'scrolling')
      add(this.headerEl, 'scrolling')
    } else {
      add(this.tableEl, CENTER_CLASS)
      remove(this.tableEl, 'scrolling')
      remove(this.headerEl, 'scrolling')
    }
  },

  scrollRight () {
    add(this.tableEl, 'scrolling-right')
    remove(this.tableEl, 'scrolling-left')
  },

  scrollLeft () {
    add(this.tableEl, 'scrolling-left')
    remove(this.tableEl, 'scrolling-right')
  },

  onUnload() {
    this.animateComparisonTable?.destroy()
  },
})
