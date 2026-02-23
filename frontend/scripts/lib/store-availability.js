import { makeRequest } from '@/scripts/lib/xhr'

const storeAvailability = (container, product, variant) => {
  const update = (variant) => {
    container.innerHTML = ''

    if (!variant) return
    const variantSectionUrl = `${container.dataset.baseUrl}/variants/${variant.id}/?section_id=store-availability`

    makeRequest('GET', variantSectionUrl).then((storeAvailabilityHTML) => {
      if (storeAvailabilityHTML.trim() === '') return

      // Remove section wrapper that throws nested sections error
      container.innerHTML = storeAvailabilityHTML.trim()
      container.innerHTML = container.firstElementChild.innerHTML
      container.setAttribute('data-variant-id', variant.id)
      container.setAttribute('data-product-title', product.title)
      container.setAttribute('data-variant-title', variant.public_title)
    })
  }

  // Intialize
  update(variant)

  const unload = () => {
    container.innerHTML = ''
  }

  return { unload, update }
}

export default storeAvailability
