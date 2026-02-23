import { qsa, toggle } from '@fluorescent/dom'
import formatMoney from '@/scripts/glow/formatMoney'

const {
  strings: { products: strings },
} = window.theme

const selectors = {
  unitPriceContainer: '[data-unit-price-container]',
  unitPrice: '[data-unit-price]',
  unitPriceBase: '[data-unit-base]',
}

const classes = {
  available: 'unit-price--available',
}

const updateUnitPrices = (container, variant) => {
  const unitPriceContainers = qsa(selectors.unitPriceContainer, container)
  const unitPrices = qsa(selectors.unitPrice, container)
  const unitPriceBases = qsa(selectors.unitPriceBase, container)

  const showUnitPricing = !variant || !variant.unit_price

  toggle(unitPriceContainers, classes.available, !showUnitPricing)

  if (!variant || !variant.unit_price) return

  _replaceText(unitPrices, formatMoney(variant.unit_price))
  _replaceText(unitPriceBases, _getBaseUnit(variant.unit_price_measurement))
}

const renderUnitPrice = (unitPrice, unitPriceMeasurement) => {
  if (unitPrice && unitPriceMeasurement) {
    const label = strings.product.unitPrice
    return `
      <div class="unit-price ${classes.available}">
        <dt>
          <span class="visually-hidden visually-hidden--inline">${label}</span>
        </dt>
        <dd class="unit-price__price">
          <span data-unit-price>${formatMoney(
            unitPrice,
          )}</span><span aria-hidden="true">/</span><span class="visually-hidden">${
            strings.product.unitPriceSeparator
          }&nbsp;</span><span data-unit-base>${_getBaseUnit(
            unitPriceMeasurement,
          )}</span>
        </dd>
      </div>
    `
  }

  return ''
}

const _getBaseUnit = (unitPriceMeasurement) => {
  return unitPriceMeasurement.reference_value === 1
    ? unitPriceMeasurement.reference_unit
    : unitPriceMeasurement.reference_value + unitPriceMeasurement.reference_unit
}

const _replaceText = (nodeList, replacementText) => {
  nodeList.forEach((node) => (node.innerText = replacementText))
}

export { updateUnitPrices, renderUnitPrice }
