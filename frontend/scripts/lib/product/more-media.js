import { qs, listen } from '@fluorescent/dom'

const selectors = {
  moreButton: '[data-more-media]',
  moreBar: '[data-more-media-bar]',
  productMedia: '[data-product-media]',
}

const states = {
  closed: 'closed',
  beforeOpen: 'beforeOpen',
  opening: 'opening',
  open: 'open',
}

const moreMedia = (node) => {
  if (!node) return

  const moreButton = qs(selectors.moreButton, node)

  if (!moreButton) return

  const moreBar = qs(selectors.moreBar, node)
  const productMedia = qs(selectors.productMedia, node)
  const initialAR = parseFloat(
    window.getComputedStyle(productMedia).aspectRatio,
  )

  let isOpen = false

  const updateText = (open) => {
    moreButton.innerHTML =
      moreButton.dataset[open ? 'langLessMedia' : 'langMoreMedia']
  }

  const close = () => {
    if (!isOpen) return

    if (!isFinite(initialAR)) {
      // If AR is NaN it's either 'auto' or unsupported by the browser,
      // in which case we can't transition it. Instead, jump directly to
      // the final state.
      productMedia.dataset.productMedia = states.closed
      isOpen = false
      updateText(false)
      return
    }

    productMedia.dataset.productMedia = states.opening

    window.requestAnimationFrame(() => {
      const transitionEnd = listen(productMedia, 'transitionend', () => {
        transitionEnd()
        productMedia.dataset.productMedia = states.closed
        isOpen = false
      })

      productMedia.dataset.productMedia = states.beforeOpen
      updateText(false)
    })
  }

  const scrollIntoView = (variantImage) => {
    if (!variantImage) return

    variantImage.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }

  const setOpen = () => {
    productMedia.dataset.productMedia = states.open
    isOpen = true
  }

  const open = (variantImage, skipTransition = false) => {
    if (isOpen) return

    if (!isFinite(initialAR)) {
      // If AR is NaN it's either 'auto' or unsupported by the browser,
      // in which case we can't transition it. Instead, jump directly to
      // the final state.
      setOpen()
      updateText(true)
      return
    }

    productMedia.dataset.productMedia = states.beforeOpen

    window.requestAnimationFrame(() => {
      const { width } = productMedia.getBoundingClientRect()
      const { scrollHeight } = productMedia
      const gridGap = parseInt(window.getComputedStyle(productMedia).rowGap, 10)
      const barBottom = parseInt(window.getComputedStyle(moreBar).bottom, 10)

      const openAspectRatio = width / (scrollHeight - gridGap - barBottom)

      productMedia.style.setProperty(
        '--overflow-gallery-aspect-ratio-open',
        openAspectRatio,
      )

      // skipTransition is only true on variant change with a variant image and hidden media
      // required to improve scrolling while expanding media
      if (skipTransition) {
        const transitionCopy = productMedia.style.transition
        productMedia.style.transition = 'none'

        setOpen()
        scrollIntoView(variantImage)

        productMedia.style.transition = transitionCopy
      } else {
        const transitionEnd = listen(productMedia, 'transitionend', (e) => {
          if (e.target !== productMedia) {
            // Ignore any bubble up even from image load transitions, etc.
            return
          }

          transitionEnd()
          scrollIntoView(variantImage)
          setOpen()
        })

        productMedia.dataset.productMedia = states.opening
      }

      updateText(true)
    })
  }

  const clickListener = listen(moreButton, 'click', () => {
    isOpen ? close() : open()
  })

  const events = [clickListener]

  const unload = () => {
    events.forEach((evt) => evt())
  }

  return { open, unload }
}

export default moreMedia
