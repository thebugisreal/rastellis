import { add, remove, qs, listen } from '@fluorescent/dom'
import switchImage from '@/scripts/utils/switch-image'

export default function (container) {
  const classes = {
    hidden: 'is-hidden',
  }

  const selectors = {
    buyButtons: '.product-form__item--submit',
    changeOptionButton: '[data-change-option-trigger]',
    imageWrap: '.product__media',
    optionValues: '.sticky-atc-bar__meta-options',
    pageFooter: 'footer',
    stickyAtcBar: '.sticky-atc-bar',
    variantSelector: '.product__variants-wrapper',
  }

  const elements = {
    buyButtons: qs(selectors.buyButtons, container),
    pageFooter: qs(selectors.pageFooter, document),
    stickyAtcBar: qs(selectors.stickyAtcBar, container),
    variantSelector: qs(selectors.variantSelector, container),
  }

  if (elements.stickyAtcBar == null) return

  elements.imageWrap = qs(selectors.imageWrap, elements.stickyAtcBar)
  elements.optionValues = qs(selectors.optionValues, elements.stickyAtcBar)
  elements.changeOptionButton = qs(
    selectors.changeOptionButton,
    elements.stickyAtcBar,
  )

  const events = []

  if (elements.changeOptionButton) {
    events.push(
      listen(elements.changeOptionButton, 'click', () =>
        scrollToVariantSelector(),
      ),
    )
  }

  let widthWatcher

  const buyButtonsObserver = new IntersectionObserver(
    ([{ isIntersecting: visible }]) => {
      if (visible) {
        hideBar()
      } else {
        showBar()
      }
    },
  )

  const footerObserver = new IntersectionObserver(
    ([{ isIntersecting: visible }]) => {
      if (visible) {
        buyButtonsObserver.disconnect()
        hideBar()
      } else {
        buyButtonsObserver.observe(elements.buyButtons)
      }
    },
    { threshold: 0.8 },
  )

  footerObserver.observe(elements.pageFooter)

  const showBar = () => {
    remove(elements.stickyAtcBar, classes.hidden)
    setHeightVariable()

    let previousWidth = window.innerWidth

    widthWatcher = () => {
      const currentWidth = window.innerWidth

      if (currentWidth !== previousWidth) {
        previousWidth = currentWidth
        setHeightVariable()
      }
    }

    window.addEventListener('resize', widthWatcher)
  }

  const hideBar = () => {
    add(elements.stickyAtcBar, classes.hidden)
    widthWatcher?.destroy()
    clearHeightVariable()
  }

  const setHeightVariable = () => {
    document.documentElement.style.setProperty(
      '--sticky-atc-bar-height',
      `${elements.stickyAtcBar.offsetHeight}px`,
    )
  }

  const clearHeightVariable = () => {
    document.documentElement.style.setProperty('--sticky-atc-bar-height', '0px')
  }

  const scrollToVariantSelector = () => {
    elements.variantSelector.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    })
  }

  const switchCurrentImage = (id) => {
    switchImage(elements.imageWrap, id)
  }

  const updateOptionValues = (variant) => {
    const optionValueString = variant.options.join(', ')
    elements.optionValues.textContent = optionValueString
  }

  const unload = () => {
    buyButtonsObserver?.disconnect()
    events.forEach((unsubscribe) => unsubscribe())
    footerObserver?.disconnect()
    window.removeEventListener('resize', widthWatcher)
  }

  return { switchCurrentImage, unload, updateOptionValues }
}
