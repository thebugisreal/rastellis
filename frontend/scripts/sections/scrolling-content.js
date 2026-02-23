import section from '@/scripts/glow/section'
import { qs, qsa, contains } from '@fluorescent/dom'
import provideResizeObserver from '@/scripts/utils/provide-resize-observer'
import animateScrollingContent from '@/scripts/lib/animation/scrolling-content'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('scrolling-content', {
  onLoad() {
    const marquee = qs('.scrolling-content__marquee', this.container)
    const content = qs('.scrolling-content__content', this.container)
    const clonedContent = this.tabProofClonedContent(content.cloneNode(true))
    let contentWidth = content.offsetWidth

    if (contentWidth === 0) return

    provideResizeObserver().then(({ ResizeObserver }) => {
      this.ro = new ResizeObserver(([{ target }]) => {
        let num = this.getNeededCloneCount(target, marquee, content)

        for (let i = 0; i < num; i++) {
          marquee.dataset.playScrollAnimation = 'false'
          marquee.appendChild(clonedContent.cloneNode(true))
        }

        if (!contains(document.documentElement, 'prefers-reduced-motion')) {
          requestAnimationFrame(() => {
            marquee.dataset.playScrollAnimation = 'true'
          })
        }
      })
      this.ro.observe(document.documentElement)
    })

    if (shouldAnimate(this.container)) {
      this.animateScrollingContent = animateScrollingContent(this.container)
    }
  },

  getNeededCloneCount(target, marquee, content) {
    return (
      Math.ceil(
        (target.offsetWidth - marquee.offsetWidth) / content.offsetWidth,
      ) + 1
    )
  },

  tabProofClonedContent(clonedContent) {
    const linkEls = qsa('a', clonedContent)

    linkEls.forEach((linkEl) => {
      linkEl.setAttribute('tabindex', '-1')
    })

    clonedContent.setAttribute('aria-hidden', true)
    return clonedContent
  },

  onUnload() {
    this.ro.disconnect()
    this.animateScrollingContent?.destroy()
  },
})
