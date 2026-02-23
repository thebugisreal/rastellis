import { qs, qsa, listen } from '@fluorescent/dom'

const selectors = {
  siblingProducts: '[data-sibling-products]',
  siblingSwatch: '[data-sibling-swatch]',
  siblingLabelEl: '[data-sibling-label-value]',
}

export default function (container) {
  const siblingProducts = qs(selectors.siblingProducts, container)
  if (!siblingProducts) return

  const siblingSwatches = qsa(selectors.siblingSwatch, siblingProducts)
  const labelValueEl = qs(selectors.siblingLabelEl, siblingProducts)
  const baseLabel = labelValueEl.innerText

  const events = []

  siblingSwatches.forEach((item) => {
    events.push(
      listen(item, 'mouseout', () => handleOut()),
      listen(item, 'mouseover', (e) => handleOver(e)),
    )
  })

  function handleOver(e) {
    const cutline = e.target.dataset.siblingCutline
    labelValueEl.innerText = cutline
  }

  function handleOut() {
    if (labelValueEl.innerText !== baseLabel) {
      labelValueEl.innerText = baseLabel
    }
  }

  const unload = () => {
    events.forEach((unsubscribe) => unsubscribe())
  }

  return {
    unload,
  }
}
