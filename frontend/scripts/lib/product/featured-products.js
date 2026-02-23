import { qs, qsa, remove } from '@fluorescent/dom'

import ProductItem from '@/scripts/lib/product-item'
import getMediaQuery from '@/scripts/lib/media-queries'
import atBreakpointChange from '@/scripts/lib/at-breakpoint-change'
import Carousel from '@/scripts/lib/carousel'

const selectors = {
  wrappingContainer: '.product__block-featured-products',
  featuredProducts: '[data-featured-products]',
  featuredProductsContent: '[data-featured-products-content]',
  leftSideMobileFeaturedProducts:
    '.left-side-blocks.for-mobile [data-featured-products]',
}

const featuredProducts = (node) => {
  const featuredProducts = qsa(selectors.featuredProducts, node)

  if (!featuredProducts.length) return

  let productItems
  let mobileSwiper
  let mobileFeaturedProducts

  const {
    recommendationsType,
    productId: id,
    sectionId,
    enableMobileSwiper,
    maxRecommendations,
  } = featuredProducts[0].dataset

  if (recommendationsType === 'app-recommendations') {
    handleRecommendedProducts()
  } else {
    // Merchant is using custom product list
    productItems = featuredProducts.map((productContainer) =>
      ProductItem(productContainer),
    )

    handleMobileSwiper()
  }

  function handleRecommendedProducts() {
    const requestUrl = `${window.theme.routes.productRecommendations}?section_id=${sectionId}&limit=${maxRecommendations}&product_id=${id}&intent=complementary`

    fetch(requestUrl)
      .then((response) => response.text())
      .then((text) => {
        const html = document.createElement('div')
        html.innerHTML = text

        const recommendations = qs(selectors.featuredProductsContent, html)

        if (recommendations && recommendations.innerHTML.trim().length) {
          featuredProducts.forEach(
            (block) => (block.innerHTML = recommendations.innerHTML),
          )

          productItems = featuredProducts.map((productContainer) =>
            ProductItem(productContainer),
          )

          // Remove hidden flag as content has been fetched
          featuredProducts.forEach((block) => {
            remove(block.closest(selectors.wrappingContainer), 'hidden')
          })

          handleMobileSwiper()
        }
      })
      .catch((error) => {
        throw error
      })
  }

  function handleMobileSwiper() {
    if (enableMobileSwiper !== 'true') return
    // Left column blocks are rendered twice to keep correct
    // ordering with right column blocks on mobile. Here we
    // target the mobile left version if it exists as it requires
    // the potential mobile swiper only.
    mobileFeaturedProducts =
      qs(selectors.leftSideMobileFeaturedProducts, node) ||
      qs(selectors.featuredProducts, node)

    if (window.matchMedia(getMediaQuery('below-720')).matches) {
      _initMobileSwiper()
    }

    atBreakpointChange(720, () => {
      if (window.matchMedia(getMediaQuery('below-720')).matches) {
        _initMobileSwiper()
      } else {
        mobileSwiper?.destroy()
      }
    })
  }

  function _initMobileSwiper() {
    mobileSwiper = Carousel(mobileFeaturedProducts, {
      slidesPerView: 2.1,
      spaceBetween: 12,
    })
  }

  function unload() {
    productItems.forEach((item) => item.unload())
    mobileSwiper?.destroy()
  }

  return { unload }
}

export default featuredProducts
