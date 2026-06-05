import { slideDown, slideUp, slideStop, isVisible } from 'slide-anim'

import section from '@/scripts/glow/section'
import { listen, qsa, qs } from '@fluorescent/dom'
import animateCollapsibleRowList from '@/scripts/lib/animation/collapsible-row-list'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import VideoModule from '@/scripts/sections/video-module'

const selectors = {
  itemTrigger: '.collapsible-row-list-item__trigger',
}

section('collapsible-row-list', {
  onLoad() {
    this.items = qsa(selectors.itemTrigger, this.container)
    this.clickHandlers = listen(this.items, 'click', (e) => {
      e.preventDefault()
      const { parentNode: group, nextElementSibling: content } = e.currentTarget

      if (content && isVisible(content)) {
        this._close(e.currentTarget, group, content)
      } else {
        this._open(e.currentTarget, group, content)
      }
    })

    VideoModule(this.container)

    if (shouldAnimate(this.container)) {
      this.animateCollapsibleRowList = animateCollapsibleRowList(this.container)
    }
  },

  _closeAllExcept(activeGroup) {
    this.items.forEach((trigger) => {
      const group = trigger.parentNode

      if (group === activeGroup) return

      const content = trigger.nextElementSibling

      if (!content || !isVisible(content)) return

      this._close(trigger, group, content)
    })
  },

  _open(label, group, content) {
    if (!content) return

    this._closeAllExcept(group)

    slideStop(content)
    slideDown(content)
    group.setAttribute('data-open', true)
    label.setAttribute('aria-expanded', true)
    content.setAttribute('aria-hidden', false)
  },

  _close(label, group, content) {
    if (!content) return

    slideStop(content)
    slideUp(content)
    group.setAttribute('data-open', false)
    label.setAttribute('aria-expanded', false)
    content.setAttribute('aria-hidden', true)
  },

  onBlockSelect({ target }) {
    const label = qs(selectors.itemTrigger, target)
    const { parentNode: group, nextElementSibling: content } = label

    this._open(label, group, content)
  },

  onUnload() {
    this.clickHandlers()
    this.animateCollapsibleRowList?.destroy()
  },
})
