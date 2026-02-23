import { on } from 'evx'
import { emit } from 'evx'
import { hydrate } from 'evx'

const selectors = {
  innerOverlay: '.header-overlay__inner',
}

const classes = {
  isVisible: 'is-visible',
  isActive: 'is-active',
}

export const events = {
  show: 'headerOverlay:show',
  hide: 'headerOverlay:hide',
  hiding: 'headerOverlay:hiding',
}

const headerOverlay = (node) => {
  if (!node) return
  const overlay = node
  const overlayInner = node.querySelector(selectors.innerOverlay)

  const overlayShowListener = on(events.show, () => _showOverlay())
  const overlayHideListener = on(events.hide, () => _hideOverlay())

  const _showOverlay = () => {
    hydrate({ headerOverlayOpen: true })
    overlay.classList.add(classes.isActive)

    setTimeout(() => {
      overlayInner.classList.add(classes.isVisible)
    }, 0)
  }

  const _hideOverlay = () => {
    hydrate({ headerOverlayOpen: false })
    emit(events.hiding)
    overlayInner.classList.remove(classes.isVisible)

    setTimeout(() => {
      overlay.classList.remove(classes.isActive)
    }, 0)
  }

  const unload = () => {
    overlayShowListener()
    overlayHideListener()
  }

  return { unload }
}

export default headerOverlay
