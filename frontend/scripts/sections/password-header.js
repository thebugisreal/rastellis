import passwordUnlock from '../lib/header/password-unlock'
import { add, listen, qs, qsa, remove, toggle } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import provideResizeObserver from '@/scripts/utils/provide-resize-observer'

function setHeaderHeightVar(height) {
  document.documentElement.style.setProperty(
    '--height-header',
    Math.ceil(height) + 'px',
  )
}

section('password-header', {
  crossBorder: {},

  onLoad() {
    const { transparentHeader } = this.container.dataset

    // This is done here AND in an inline script so it's responsive in the theme editor before this JS is loaded.
    document.body.classList.toggle('header-transparent', !!transparentHeader)

    provideResizeObserver().then(({ ResizeObserver }) => {
      // This will watch the height of the header and update the --height-header
      // css variable when necessary. That var gets used for the negative top margin
      // to render the page body under the transparent header
      this.ro = new ResizeObserver(([{ target }]) => {
        setHeaderHeightVar(
          target.getBoundingClientRect()
            ? target.getBoundingClientRect().height
            : target.offsetHeight,
        )
      })
      this.ro.observe(this.container)
    })

    this.passwordUnlock = passwordUnlock(this.container)
  },

  onUnload() {
    this.listeners.forEach((l) => l())
    this.components.forEach((c) => c.destroy())
    this.passwordUnlock

    this.io && this.io.disconnect()
    this.ro.disconnect()
  },
})
