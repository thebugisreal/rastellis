import { qsa, qs, listen } from '@fluorescent/dom'
import { emit } from 'evx'

const selectors = {
  popupTrigger: '[data-popup-trigger]',
}

const passwordUnlock = (node) => {
  const events = []

  const popupTriggers = qsa(selectors.popupTrigger, node)

  if (popupTriggers.length) {
    events.push(
      listen(popupTriggers, 'click', (e) => {
        e.preventDefault()
        e.stopPropagation()

        const content = qs('#modal-password-unlock', node)

        emit('modal:open', null, {
          modalContent: content,
        })
      }),
    )
  }

  function unload() {
    events.forEach((evt) => evt())
  }

  return { unload }
}

export default passwordUnlock
