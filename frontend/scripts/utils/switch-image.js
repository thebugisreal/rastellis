import { add, qs, qsa, remove } from '@fluorescent/dom'

const selectors = {
  imageById: (id) => `[data-media-item-id='${id}']`,
  imageWrapper: '[data-product-media-wrapper]',
  inYourSpace: '[data-in-your-space]',
}

const classes = {
  hidden: 'hidden',
}

export default function (container, imageId, inYourSpaceButton) {
  const newImage = qs(
    selectors.imageWrapper + selectors.imageById(imageId),
    container,
  )

  const otherImages = qsa(
    `${selectors.imageWrapper}:not(${selectors.imageById(imageId)})`,
    container,
  )

  newImage && remove(newImage, classes.hidden)

  // Update view in space button
  if (inYourSpaceButton) {
    if (newImage.dataset.mediaType === 'model') {
      inYourSpaceButton.setAttribute(
        'data-shopify-model3d-id',
        newImage.dataset.mediaItemId,
      )
    }
  }

  otherImages.forEach((image) => add(image, classes.hidden))
}
