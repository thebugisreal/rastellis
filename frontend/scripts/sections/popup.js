import { qsa } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import Popup from '@/scripts/lib/popup'

section('popup', {
  onLoad() {
    this.popups = qsa('[data-popup]', this.container).map((popup) => {
      return { contructor: Popup(popup), element: popup }
    })
  },

  onBlockSelect({ target }) {
    const targetPopup = this.popups.find((o) => o.element === target)
    targetPopup.contructor.showPopup()
  },

  onBlockDeselect({ target }) {
    const targetPopup = this.popups.find((o) => o.element === target)
    targetPopup.contructor.hidePopup()
  },

  onUnload() {
    this.popups.forEach((popup) => popup.contructor?.unload())
  },
})
