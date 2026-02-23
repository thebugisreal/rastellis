import formatMoney from '@/scripts/glow/formatMoney'
import { qs, qsa } from '@fluorescent/dom'

const {
  strings: { products: strings },
} = window.theme

const selectors = {
  price: '[data-price]',
  comparePrice: '[data-compare-price]',
  defaultProductContainer: '.product__top',
  quickProductContainer: '.quick-product',
}

export default function (container, variant, productTemplate) {
  const price = qsa(selectors.price, container)
  const comparePrice = qsa(selectors.comparePrice, container)
  const unavailableString = strings.product.unavailable

  if (!variant) {
    price.forEach((el) => (el.innerHTML = unavailableString))
    comparePrice.forEach((el) => (el.innerHTML = ''))
    return
  }

  const defaultProdContainer = qs(selectors.defaultProductContainer, container)
  const quickProdContainer = qs(selectors.quickProductContainer, document)

  let productContainer
  if (productTemplate) {
    productContainer = defaultProdContainer
  } else {
    productContainer = quickProdContainer
  }

  const {
    zeroPriceDisplay,
    zeroPriceCustomContent,
    soldOutPriceDisplay,
    soldOutPriceCustomContent,
  } = productContainer.dataset

  let priceContentType = 'price'
  let priceContent = formatMoney(variant.price)

  if (variant.available) {
    if (variant.compare_at_price === null && variant.price === 0) {
      if (zeroPriceDisplay === 'hide') {
        priceContentType = 'hide'
        priceContent = ''
      } else {
        if (zeroPriceDisplay === 'replace') {
          priceContentType = 'custom'
          priceContent = zeroPriceCustomContent
        }
      }
    }
  } else {
    if (soldOutPriceDisplay === 'hide') {
      priceContentType = 'hide'
      priceContent = ''
    } else {
      if (soldOutPriceDisplay === 'replace') {
        priceContentType = 'custom'
        priceContent = soldOutPriceCustomContent
      }
    }
  }

  if (productTemplate) {
    defaultProdContainer.setAttribute(
      'data-price-display-type',
      priceContentType,
    )
  } else {
    quickProdContainer.setAttribute('data-price-display-type', priceContentType)
  }

  price.forEach((el) => (el.innerHTML = priceContent))
  comparePrice.forEach(
    (el) =>
      (el.innerHTML =
        variant.compare_at_price > variant.price && priceContentType === 'price'
          ? formatMoney(variant.compare_at_price)
          : ''),
  )
}
