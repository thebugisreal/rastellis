import { qs } from '@fluorescent/dom'

const selectors = {
  productSku: '[data-product-sku]',
  productSkuContainer: '.product__vendor_and_sku',
}

const {
  strings: { products: strings },
} = window.theme

export default function (container, variant) {
  const skuElement = qs(selectors.productSku, container)
  const skuContainer = qs(selectors.productSkuContainer, container)

  if (!skuElement) return

  const { sku } = strings.product
  const skuString = (value) => `${sku}: ${value}`

  if (!variant || !variant.sku) {
    skuElement.innerText = ''
    skuContainer.setAttribute('data-showing-sku', false)
    return
  }

  skuElement.innerText = skuString(variant.sku)
  skuContainer.setAttribute('data-showing-sku', true)
}
