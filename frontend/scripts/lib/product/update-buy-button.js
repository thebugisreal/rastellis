import { qs } from '@fluorescent/dom'

export default function (btn, variant) {
  const text = qs('[data-add-to-cart-text]', btn)
  const { langAvailable, langUnavailable, langSoldOut } = btn.dataset

  if (!variant) {
    btn.setAttribute('disabled', 'disabled')
    text.textContent = langUnavailable
  } else if (variant.available) {
    btn.removeAttribute('disabled')
    text.textContent = langAvailable
  } else {
    btn.setAttribute('disabled', 'disabled')
    text.textContent = langSoldOut
  }
}
