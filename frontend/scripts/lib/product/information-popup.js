import { qsa, qs, listen } from '@fluorescent/dom'
import { emit } from 'evx'

const selectors = {
  popupTrigger: '[data-popup-trigger]',
}

const informationPopup = (node) => {
  const events = []

  const popupTriggers = qsa(selectors.popupTrigger, node)

  if (!popupTriggers.length) {
    return
  }

  const listener = listen(popupTriggers, 'click', (e) => {
    e.preventDefault()
    e.stopPropagation()

    const { modalContentId } = e.target.dataset
    const content = qs(`#${modalContentId}`, node)

    emit('modal:open', null, {
      modalContent: content,
    })
  })
  events.push(listener)

  function unload() {
    events.forEach((evt) => evt())
  }

  return { unload }
}

export default informationPopup
