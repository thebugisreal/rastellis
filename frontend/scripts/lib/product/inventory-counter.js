import { qs, add, remove, toggle } from '@fluorescent/dom'

const selectors = {
  counterContainer: '[data-inventory-counter]',
  inventoryMessage: '.inventory-counter__message',
  countdownBar: '.inventory-counter__bar',
  progressBar: '.inventory-counter__bar-progress',
}

const classes = {
  hidden: 'hidden',
  inventoryLow: 'inventory--low',
  inventoryEmpty: 'inventory--empty',
  inventoryUnavailable: 'inventory--unavailable',
}

const inventoryCounter = (container, config) => {
  const variantsInventories = config.variantsInventories
  const counterContainer = qs(selectors.counterContainer, container)
  const inventoryMessageElement = qs(selectors.inventoryMessage, container)
  const progressBar = qs(selectors.progressBar, container)
  const {
    lowInventoryThreshold,
    showUntrackedQuantity,
    stockCountdownMax,
    unavailableText,
  } = counterContainer.dataset

  // If the threshold or countdownmax contains anything but numbers abort
  if (
    !lowInventoryThreshold.match(/^[0-9]+$/) ||
    !stockCountdownMax.match(/^[0-9]+$/)
  ) {
    return
  }

  const threshold = parseInt(lowInventoryThreshold, 10)
  const countDownMax = parseInt(stockCountdownMax, 10)

  toggle(
    counterContainer,
    classes.hidden,
    !productIventoryValid(variantsInventories[config.id]),
  )

  checkThreshold(variantsInventories[config.id])
  setProgressBar(
    variantsInventories[config.id].inventory_quantity,
    variantsInventories[config.id].inventory_management,
  )
  setInventoryMessage(variantsInventories[config.id].inventory_message)

  function checkThreshold({
    inventory_policy,
    inventory_quantity,
    inventory_management,
  }) {
    remove(counterContainer, classes.inventoryLow)

    if (inventory_management !== null) {
      if (inventory_quantity <= 0 && inventory_policy === 'deny') {
        add(counterContainer, classes.inventoryEmpty)
        counterContainer.setAttribute('data-stock-category', 'empty')
      } else if (
        inventory_quantity <= threshold ||
        (inventory_quantity <= 0 && inventory_policy === 'continue')
      ) {
        counterContainer.setAttribute('data-stock-category', 'low')
      } else {
        counterContainer.setAttribute('data-stock-category', 'sufficient')
      }
    } else if (
      inventory_management === null &&
      showUntrackedQuantity == 'true'
    ) {
      counterContainer.setAttribute('data-stock-category', 'sufficient')
    }
  }

  function setProgressBar(inventoryQuantity, inventoryManagement) {
    if (inventoryManagement === null && showUntrackedQuantity == 'true') {
      progressBar.style.width = `${100}%`
      return
    }

    if (inventoryQuantity <= 0) {
      progressBar.style.width = `${0}%`
      return
    }

    const progressValue =
      inventoryQuantity < countDownMax
        ? (inventoryQuantity / countDownMax) * 100
        : 100

    progressBar.style.width = `${progressValue}%`
  }

  function setInventoryMessage(message) {
    inventoryMessageElement.innerText = message
  }

  function productIventoryValid(product) {
    return (
      product.inventory_message &&
      (product.inventory_management !== null ||
        (product.inventory_management === null &&
          showUntrackedQuantity == 'true'))
    )
  }

  const update = (variant) => {
    if (!variant) {
      setUnavailable()
      return
    }

    toggle(
      counterContainer,
      classes.hidden,
      !productIventoryValid(variantsInventories[variant.id]),
    )

    checkThreshold(variantsInventories[variant.id])
    setProgressBar(
      variantsInventories[variant.id].inventory_quantity,
      variantsInventories[variant.id].inventory_management,
    )
    setInventoryMessage(variantsInventories[variant.id].inventory_message)
  }

  function setUnavailable() {
    remove(counterContainer, classes.hidden)
    add(counterContainer, classes.inventoryUnavailable)
    counterContainer.setAttribute('data-stock-category', 'unavailable')
    setProgressBar(0)
    setInventoryMessage(unavailableText)
  }

  return { update }
}

export default inventoryCounter
