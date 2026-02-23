import { createFocusTrap } from 'focus-trap'
import { add, listen, qs, qsa, remove, toggle } from '@fluorescent/dom'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import Delegate from 'ftdomdelegate'

import { on } from 'evx'
import wrapIframes from '@/scripts/lib/rte/wrapIframes'
import wrapTables from '@/scripts/lib/rte/wrapTables'

const classes = {
  visible: 'is-visible',
  active: 'active',
  fixed: 'is-fixed',
}

const selectors = {
  closeBtn: '[data-modal-close]',
  wash: '.modal__wash',
  modalContent: '.modal__content',
}

const modal = (node) => {
  const focusTrap = createFocusTrap(node, { allowOutsideClick: true })
  const modalContent = qs(selectors.modalContent, node)

  const delegate = new Delegate(document)

  delegate.on('click', selectors.wash, () => _close())

  const events = [
    listen(qs(selectors.closeBtn, node), 'click', (e) => {
      e.preventDefault()
      _close()
    }),
    listen(node, 'keydown', ({ keyCode }) => {
      if (keyCode === 27) _close()
    }),
    on('modal:open', (state, { modalContent, narrow = false }) => {
      toggle(node, 'modal--narrow', narrow)
      _renderModalContent(modalContent)
      _open()
    }),
  ]

  const _renderModalContent = (content) => {
    const clonedContent = content.cloneNode(true)
    modalContent.innerHTML = ''
    modalContent.appendChild(clonedContent)
    wrapIframes(qsa('iframe', modalContent))
    wrapTables(qsa('table', modalContent))
  }

  const _open = () => {
    // Due to this component being shared between templates we have to
    // animate around it being fixed to the window
    add(node, classes.active)
    document.body.setAttribute('data-fluorescent-overlay-open', 'true')

    focusTrap.activate()
    disableBodyScroll(node, {
      allowTouchMove: (el) => {
        while (el && el !== document.body) {
          if (el.getAttribute('data-scroll-lock-ignore') !== null) {
            return true
          }
          el = el.parentNode
        }
      },
      reserveScrollBarGap: true,
    })
  }

  const _close = () => {
    focusTrap.deactivate()
    remove(node, classes.active)
    document.body.setAttribute('data-fluorescent-overlay-open', 'false')
    enableBodyScroll(node)

    setTimeout(() => {
      modalContent.innerHTML = ''
    }, 300)
  }

  const unload = () => {
    events.forEach((unsubscribe) => unsubscribe())
  }

  return { unload }
}

export default modal
