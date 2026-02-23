import { listen, qs, qsa, toggle } from '@fluorescent/dom'

export default function OptionButtons(els) {
  const groups = els.map(createOptionGroup)

  function destroy() {
    groups && groups.forEach((group) => group())
  }

  return { groups, destroy }
}

function createOptionGroup(el) {
  const select = qs('select', el)
  const buttons = qsa('[data-button]', el)
  const buttonClick = listen(buttons, 'click', (e) => {
    e.preventDefault()
    const buttonEl = e.currentTarget
    const { optionHandle } = buttonEl.dataset

    buttons.forEach((btn) => {
      toggle(btn, 'selected', btn.dataset.optionHandle === optionHandle)
    })

    const opt = qs(`[data-value-handle="${optionHandle}"]`, select)
    opt.selected = true

    select.dispatchEvent(new Event('change'))
  })

  return () => buttonClick()
}
