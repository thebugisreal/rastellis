import { getUrlWithVariant } from '@shopify/theme-product-form'
import isMobile from 'is-mobile'
import { getVariantFromId } from '@shopify/theme-product'
import scrollContainer from '@/scripts/lib/scroll-container'
import getMediaQuery from '@/scripts/lib/media-queries'
import atBreakpointChange from '@/scripts/lib/at-breakpoint-change'
import SocialShare from '@/scripts/lib/social-share'

import { add, listen, qs, qsa, remove, toggle } from '@fluorescent/dom'
import cart from '@/scripts/glow/cart'
import getProduct from '@/scripts/glow/getProduct'
import { emit } from 'evx'

import accordions from '@/scripts/lib/accordions'
import Media from '@/scripts/lib/media'
import ProductForm from '@/scripts/lib/product-form'
import switchImage from '@/scripts/utils/switch-image'
import quantityInput from '@/scripts/lib/product/quantity-input'
import informationPopup from '@/scripts/lib/product/information-popup'
import moreMedia from '@/scripts/lib/product/more-media'
import updatePrices from '@/scripts/lib/product/update-prices'
import updateSku from '@/scripts/lib/product/update-sku'
import updateBuyButton from '@/scripts/lib/product/update-buy-button'
import reviewsHandler from '@/scripts/lib/product/reviews-handler'
import optionButtons from '@/scripts/lib/product/option-buttons'
import inventoryCounter from '@/scripts/lib/product/inventory-counter'
import featuredProducts from '@/scripts/lib/product/featured-products'
import variantAvailability from '@/scripts/lib/product/variant-availability'
import siblingProducts from '@/scripts/lib/product/sibling-products'
import giftCardRecipient from '@/scripts/lib/product/gift-card-recipient'
import stickyAtcBar from '@/scripts/lib/product/sticky-atc-bar'
import { default as stickyScroll } from '@/scripts/lib/sticky-scroll'
import productLightbox from '@/scripts/lib/product-lightbox'
import { updateUnitPrices } from '@/scripts/lib/unit-pricing'
import { updateRecentProducts } from '@/scripts/lib/recently-viewed-products'
import storeAvailability from '@/scripts/lib/store-availability'
import wrapIframes from '@/scripts/lib/rte/wrapIframes'
import wrapTables from '@/scripts/lib/rte/wrapTables'
import dispatchCustomEvent from '@/scripts/lib/dispatch-custom-event'

const selectors = {
  form: '[data-product-form]',
  addToCart: '[data-add-to-cart]',
  variantSelect: '[data-variant-select]',
  optionById: (id) => `[value='${id}']`,
  thumbs: '[data-product-thumbnails]',
  thumb: '[data-product-thumbnail]',
  storeAvailability: '[data-store-availability-container]',
  quantityError: '[data-quantity-error]',
  productOption: '.product__option',
  optionLabelValue: '[data-selected-value-for-option]',
  displayedDiscount: '[data-discount-display]',
  displayedDiscountByVariantId: (id) =>
    `[variant-discount-display][variant-id="${id}"]`,
  nonSprRatingCountLink: '.product__rating-count-potential-link',
  photosMobile: '.product__media-container.below-mobile',
  mobileCarousel: '.product__media-container.below-mobile.carousel',
  photosDesktop: '.product__media-container.above-mobile',
  mobileFeaturedImage: ".carousel_slide[data-is-featured='true']",
  priceWrapper: '.product__price',
  quickCart: '.quick-cart',
  purchaseConfirmation: '.purchase-confirmation-popup',
  productReviews: '#shopify-product-reviews',
  customOptionInputs: '[data-custom-option-input]',
  customOptionInputTargetsById: (id) => `[data-custom-option-target='${id}']`,
  giftCardRecipientContainer: '.product-form__gift-card-recipient',
  productMedia: '[data-product-media]',
  moreMediaButton: '[data-more-media]',
}

const useCustomEvents = window.flu.states?.useCustomEvents

class Product {
  constructor(node) {
    this.container = node

    const {
      isQuickView,
      isFullProduct,
      isFeaturedProduct,
      enableStickyContainer,
      loopMobileCarousel,
      hideMobileCarouselDots,
      enableMultipleVariantMedia,
      initialMediaId,
      sectionId,
      productHandle,
    } = this.container.dataset
    this.isQuickView = isQuickView
    this.isFullProduct = isFullProduct
    this.isFeaturedProduct = isFeaturedProduct
    this.loopMobileCarousel = loopMobileCarousel === 'true'
    this.hideMobileCarouselDots = hideMobileCarouselDots === 'true'
    this.enableMultipleVariantMedia = enableMultipleVariantMedia
    this.previousMediaId = initialMediaId
    this.sectionId = sectionId
    this.productHandle = productHandle

    this.formElement = qs(selectors.form, this.container)
    this.quantityError = qs(selectors.quantityError, this.container)

    this.displayedDiscount = qs(selectors.displayedDiscount, this.container)

    this.viewInYourSpace = qs('[data-in-your-space]', this.container)
    this.viewInYourSpace && toggle(this.viewInYourSpace, 'visible', isMobile())

    this.photosDesktop = qs(selectors.photosDesktop, this.container)

    this.mobileQuery = window.matchMedia(getMediaQuery('below-960'))
    this.breakPointHandler = atBreakpointChange(960, () => {
      if (this.isFullProduct) {
        if (this.mobileQuery.matches) {
          this._initPhotoCarousel()
        } else {
          this.mobileSwiper?.destroy()
        }
      }

      this._initStickyScroll()
    })

    this._initThumbnails()

    // Handle Surface pickup
    this.storeAvailabilityContainer = qs(
      selectors.storeAvailability,
      this.container,
    )
    this.availability = null

    // Handle Shopify Product Reviews if they exist as a product block
    this.reviewsHandler = reviewsHandler(
      qs(selectors.productReviews, this.container),
      this.container,
    )

    // // non-SPR rating display
    let nonSprRatingCount = qs(selectors.nonSprRatingCountLink, this.container)

    if (nonSprRatingCount && !qs(selectors.productReviews, document)) {
      // The rating count links to "#shopify-product-reviews" but
      // if that block doesn't exist we should remove the link
      nonSprRatingCount.removeAttribute('href')
    }

    if (this.formElement) {
      const { productHandle, currentProductId } = this.formElement.dataset
      const product = getProduct(productHandle)

      product((data) => {
        const variant = getVariantFromId(data, parseInt(currentProductId))

        if (this.storeAvailabilityContainer && variant) {
          this.availability = storeAvailability(
            this.storeAvailabilityContainer,
            data,
            variant,
          )
        }

        this.productForm = ProductForm(this.container, this.formElement, data, {
          onOptionChange: (e) => this.onOptionChange(e),
          onFormSubmit: (e) => this.onFormSubmit(e),
          onQuantityChange: (e) => this.onQuantityChange(e),
        })

        if (
          this.productThumbnails &&
          variant.featured_media?.id == initialMediaId
        ) {
          this.scrollThumbnails(variant)
        }

        const productInventoryJson = qs(
          '[data-product-inventory-json]',
          this.container,
        )

        if (productInventoryJson) {
          const jsonData = JSON.parse(productInventoryJson.innerHTML)
          const variantsInventories = jsonData.inventory

          if (variantsInventories) {
            const config = {
              id: variant.id,
              variantsInventories,
            }
            this.inventoryCounter = inventoryCounter(this.container, config)
          }
        }
      })
    }

    this.quantityInput = quantityInput(this.container)
    this.customOptionInputs = qsa(selectors.customOptionInputs, this.container)
    this.socialButtons = qsa('[data-social-share]', this.container)
    this.featuredProducts = featuredProducts(this.container)

    if (enableStickyContainer === 'true') {
      this._initStickyScroll()
    }

    this._loadAccordions()

    this.optionButtons = optionButtons(
      qsa('[data-option-buttons]', this.container),
    )

    this.informationPopup = informationPopup(this.container)

    const productDescriptionWrapper = qs(
      '.product__description',
      this.container,
    )

    if (productDescriptionWrapper) {
      wrapIframes(qsa('iframe', productDescriptionWrapper))
      wrapTables(qsa('table', productDescriptionWrapper))
    }

    const socialShareContainer = qs('.social-share', this.container)

    if (socialShareContainer) {
      this.socialShare = SocialShare(socialShareContainer)
    }

    if (this.isFullProduct && this.productHandle !== null) {
      updateRecentProducts(this.productHandle)
    }

    this._loadMedia()
    this._initEvents()

    // Handle dynamic variant options
    this.variantAvailability = variantAvailability(this.container)

    // Handle sibling products
    this.siblingProducts = siblingProducts(this.container)

    // Gift card recipient
    this.giftCardRecipient = giftCardRecipient(this.container)

    // Sticky ATC Bar
    this.stickyAtcBar = stickyAtcBar(this.container)
  }

  _initEvents() {
    this.events = [
      listen(this.productThumbnailItems, 'click', (e) => {
        e.preventDefault()
        const {
          currentTarget: { dataset },
        } = e

        this.productThumbnailItems.forEach((thumb) => remove(thumb, 'active'))
        add(e.currentTarget, 'active')

        switchImage(
          this.desktopMedia,
          dataset.thumbnailId,
          this.viewInYourSpace,
        )
      }),
    ]

    // Adds listeners for each custom option, to sync input changes
    if (this.customOptionInputs) {
      this.customOptionInputs.forEach((input) => {
        const id = input.dataset.customOptionInput
        const target = qs(
          selectors.customOptionInputTargetsById(id),
          this.container,
        )

        this.events.push(
          listen(input, 'change', (e) => {
            // Update the hidden input within the form, per type
            if (e.target.type === 'checkbox') {
              target.checked = e.target.checked
            } else {
              target.value = e.target.value
            }
          }),
        )
      })
    }
  }

  _initStickyScroll() {
    if (this.mobileQuery.matches) {
      if (this.stickyScroll) {
        this.stickyScroll.destroy()
        this.stickyScroll = null
      }
    } else if (!this.stickyScroll) {
      this.stickyScroll = stickyScroll(this.container)
    }
  }

  _initPhotoCarousel() {
    let swiperWrapper = qs(selectors.mobileCarousel, this.container)

    if (!swiperWrapper) {
      return
    }
    const mobileFeaturedImage = qs(selectors.mobileFeaturedImage, swiperWrapper)
    const initialSlide = mobileFeaturedImage
      ? parseInt(mobileFeaturedImage.dataset.slideIndex)
      : 0

    import('@/scripts/manualChunks/swiper.js').then(
      ({ Swiper, Pagination }) => {
        this.mobileSwiper = new Swiper(swiperWrapper, {
          modules: [Pagination],
          slidesPerView: 1,
          spaceBetween: 4,
          grabCursor: true,
          pagination: this.hideMobileCarouselDots
            ? {}
            : {
                el: '.swiper-pagination',
                type: 'bullets',
                dynamicBullets: true,
                dynamicMainBullets: 7,
                clickable: true,
              },
          watchSlidesProgress: true,
          loop: this.loopMobileCarousel,
          autoHeight: true,
          initialSlide: initialSlide,
        })

        this.mobileSwiper.on('slideChange', (evt) => {
          if (this.viewInYourSpace) {
            const activeSlide = evt.slides[evt.activeIndex]
            if (activeSlide.dataset.mediaType === 'model') {
              this.viewInYourSpace.setAttribute(
                'data-shopify-model3d-id',
                activeSlide.dataset.mediaItemId,
              )
            }
          }

          this.mediaContainersMobile &&
            this.mediaContainersMobile.pauseActiveMedia()
        })
      },
    )
  }

  _initThumbnails() {
    this.productThumbnails = qs(selectors.thumbs, this.container)
    this.productThumbnailItems = qsa(selectors.thumb, this.container)

    if (this.productThumbnails) {
      this.productThumbnailsScroller = scrollContainer(this.productThumbnails)
    }
  }

  _loadMedia() {
    this.mobileMedia = qs(selectors.photosMobile, this.container)
    this.desktopMedia = qs(selectors.photosDesktop, this.container)
    this.mobileMoreMedia = moreMedia(this.mobileMedia)
    this.desktopMoreMedia = moreMedia(this.desktopMedia)
    this.mediaContainers = Media(this.desktopMedia)
    this.mediaContainersMobile = Media(this.mobileMedia)
    this._initThumbnails()
    productLightbox()

    if (this.isFullProduct && this.mobileQuery.matches) {
      this._initPhotoCarousel()
    }
  }

  _loadAccordions() {
    this.accordions = []
    const accordionElements = qsa('.accordion', this.container)
    accordionElements.forEach((accordion) => {
      const accordionOpen = accordion.classList.contains('accordion--open')
      this.accordions.push(accordions(accordion, { firstOpen: accordionOpen }))

      const accordionParent = accordion.parentElement
      if (
        accordionParent.classList.contains('rte--product') &&
        !accordionParent.classList.contains('accordion accordion--product')
      ) {
        accordion.classList.add('rte--product', 'accordion--product')
      }
    })
  }

  _switchCurrentImage(id) {
    const imagesWraps = qsa('.product__media', this.container)
    imagesWraps.forEach((imagesWrap) => switchImage(imagesWrap, id))
  }

  _refreshOverviewWithVariant(variant_id) {
    const requestURL = `${window.location.pathname}?section_id=${this.sectionId}&variant=${variant_id}`
    const target = qs('.product__primary-left', this.container)
    const mediaContainers = qsa(
      `${selectors.photosDesktop}, ${selectors.photosMobile}`,
      target,
    )

    mediaContainers.forEach((container) => {
      add(container, 'loading')
    })

    fetch(requestURL)
      .then((response) => response.text())
      .then((text) => {
        const source = new DOMParser()
          .parseFromString(text, 'text/html')
          .querySelector('.product__primary-left')

        target.innerHTML = source.innerHTML

        // unload left column components
        this._unloadMedia()
        this.accordions.forEach((accordion) => accordion.unload())
        this.featuredProducts?.unload()
        this.events.forEach((unsubscribe) => unsubscribe())

        // re-initialize left column components
        this._loadMedia()
        this._loadAccordions()
        this.featuredProducts = featuredProducts(this.container)
        this._initEvents()
      })
      .catch((error) => {
        throw error
      })
  }

  // When the user changes a product option
  onOptionChange({ dataset: { variant }, srcElement }) {
    // Update option label
    const optionParentWrapper = srcElement.closest(selectors.productOption)
    const optionLabel = qs(selectors.optionLabelValue, optionParentWrapper)

    if (optionLabel) {
      optionLabel.textContent = srcElement.value
    }

    const buyButtonEls = qsa(selectors.addToCart, this.container)

    const priceWrapper = qs(selectors.priceWrapper, this.container)

    priceWrapper && toggle(priceWrapper, 'hide', !variant)

    // Update prices to reflect selected variant
    const defaultProductTemplate = this.isFullProduct === 'true' ? true : false
    updatePrices(this.container, variant, defaultProductTemplate)

    // Update buy button
    buyButtonEls.forEach((buyButton) => {
      updateBuyButton(buyButton, variant)
    })

    // Update unit pricing
    updateUnitPrices(this.container, variant)

    // Update sku
    updateSku(this.container, variant)

    // Update product availability content
    this.availability && this.availability.update(variant)

    // Update displayed discount
    if (this.displayedDiscount) {
      const newDiscountEl =
        variant &&
        qs(selectors.displayedDiscountByVariantId(variant.id), this.container)

      if (variant && newDiscountEl) {
        this.displayedDiscount.textContent = newDiscountEl.textContent
      } else {
        this.displayedDiscount.textContent = ''
      }
    }

    this.inventoryCounter && this.inventoryCounter.update(variant)

    if (useCustomEvents) {
      dispatchCustomEvent('product:variant-change', { variant: variant })
    }

    if (!variant) {
      updateBuyButton(qs('[data-add-to-cart]', this.container), false)

      this.availability && this.availability.unload()
      return
    }

    // Update URL with selected variant
    const url = getUrlWithVariant(window.location.href, variant.id)
    window.history.replaceState({ path: url }, '', url)

    // We need to set the id input manually so the Dynamic Checkout Button works
    const selectedVariantOpt = qs(
      `${selectors.variantSelect} ${selectors.optionById(variant.id)}`,
      this.container,
    )
    selectedVariantOpt.selected = true

    // We need to dispatch an event so Shopify pay knows the form has changed
    this.formElement.dispatchEvent(new Event('change'))

    // Update selected variant image and thumb
    if (variant.featured_media) {
      if (
        this.enableMultipleVariantMedia === 'true' &&
        variant.featured_media.id != this.previousMediaId
      ) {
        this._refreshOverviewWithVariant(variant.id)
        this.previousMediaId = variant.featured_media.id
      } else if (this.isFullProduct) {
        if (this.mobileSwiper) {
          const slidesWrap = this.mobileSwiper.el
          const targetSlide = qs(
            `[data-media-item-id="${variant.featured_media.id}"]`,
            slidesWrap,
          )

          if (targetSlide) {
            const targetSlideIndex = [
              ...targetSlide.parentElement.children,
            ].indexOf(targetSlide)
            this.mobileSwiper.slideTo(targetSlideIndex)
          }
        } else {
          const imagesWrap = qs('.product__media-container.above-mobile')

          if (imagesWrap.dataset.galleryStyle === 'thumbnails') {
            switchImage(
              this.desktopMedia,
              variant.featured_media.id,
              this.viewInYourSpace,
            )

            this.highlightActiveThumbnail(this.desktopMedia, variant)
            this.scrollThumbnails(variant)
          } else {
            if (this.isFeaturedProduct) {
              this._switchCurrentImage(variant.featured_media.id)
            } else {
              const targetImage = qs(
                `.product__media-container.above-mobile [data-media-id="${variant.featured_media.id}"]`,
              )
              const moreMediaButton = qs(
                selectors.moreMediaButton,
                this.container,
              )
              const productMedia = qs(selectors.productMedia, this.container)
              let visibleVariantImage = true

              if (moreMediaButton) {
                const mediaLimit = parseInt(productMedia.dataset.mediaLimit)

                visibleVariantImage =
                  productMedia.dataset.productMedia === 'open' ||
                  mediaLimit >= variant.featured_media.position
              }

              if (!moreMediaButton || visibleVariantImage) {
                targetImage?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                  inline: 'nearest',
                })
              } else if (!visibleVariantImage) {
                this.desktopMoreMedia.open(targetImage, true)
              }
            }
          }
        }
      } else {
        this._switchCurrentImage(variant.featured_media.id)
      }
    }

    // Update sticky add-to-cart variant image and option values
    if (this.stickyAtcBar) {
      if (variant.featured_media) {
        this.stickyAtcBar.switchCurrentImage(variant.featured_media.id)
      }

      this.stickyAtcBar.updateOptionValues(variant)
    }
  }

  highlightActiveThumbnail(photos, variant) {
    const thumb = qs(
      `[data-thumbnail-id="${variant.featured_media.id}"]`,
      photos,
    )

    this.productThumbnailItems.forEach((thumb) => remove(thumb, 'active'))
    thumb && add(thumb, 'active')
  }

  scrollThumbnails(variant) {
    if (!variant.featured_media) return

    const groupThumb = qs(
      `[data-thumbnail-id="${variant.featured_media.id}"]`,
      this.productThumbnails,
    ).closest('li')

    this.productThumbnailsScroller.scrollTo(groupThumb)
  }

  // When user updates quantity
  onQuantityChange({ dataset: { variant, quantity } }) {
    // Adjust the hidden quantity input within the form
    const quantityInputs = [...qsa('[name="quantity"]', this.formElement)]
    quantityInputs.forEach((quantityInput) => {
      quantityInput.value = quantity
    })

    if (useCustomEvents) {
      dispatchCustomEvent('product:quantity-update', {
        quantity: quantity,
        variant: variant,
      })
    }
  }

  // When user submits the product form
  onFormSubmit(e) {
    const purchaseConfirmation = qs(selectors.purchaseConfirmation, document)
    const quickCart = qs(selectors.quickCart, document)
    const buttonEls = qsa(selectors.addToCart, this.container)

    buttonEls.forEach((button) => {
      add(button, 'loading')
    })

    // if quick cart and confirmation popup are enable submit form
    if (!purchaseConfirmation && !quickCart) return

    e.preventDefault()

    add(this.quantityError, 'hidden')

    cart
      .addItem(this.formElement)
      .then(({ item }) => {
        buttonEls.forEach((button) => {
          remove(button, 'loading')
        })

        if (purchaseConfirmation) {
          emit('confirmation-popup:open', null, { product: item })
        } else {
          emit('quick-cart:updated')
          // Need a delay to allow quick-cart to refresh
          setTimeout(() => {
            emit('quick-cart:open')
          }, 300)
        }

        if (useCustomEvents) {
          dispatchCustomEvent('cart:item-added', { product: item })
        }
      })
      .catch((error) => {
        cart.get() // update local cart data
        if (error && error.message) {
          if (typeof error.message === 'object') {
            const sectionID = qs(
              selectors.giftCardRecipientContainer,
              this.container,
            ).dataset.sectionId

            Object.entries(error.message).forEach(([key, value]) => {
              const errorMessageID = `display-gift-card-recipient-${key}-error--${sectionID}`
              const errorMessage = qs(`#${errorMessageID}`, this.container)
              const errorInput = qs(
                `#display-gift-card-recipient-${key}--${sectionID}`,
                this.container,
              )

              errorMessage.innerText = value
              remove(errorMessage, 'hidden')
              errorInput.setAttribute('aria-invalid', true)
              errorInput.setAttribute('aria-describedby', errorMessageID)
            })
          } else {
            this.quantityError.innerText = error.message
            remove(this.quantityError, 'hidden')
          }
        } else {
          this.quantityError.innerText = this.quantityErorr.getAttribute(
            'data-fallback-error-message',
          )

          remove(this.quantityError, 'hidden')
        }
        const buttonEls = qsa(selectors.addToCart, this.container)
        buttonEls.forEach((button) => {
          remove(button, 'loading')
        })
      })
  }

  _unloadMedia() {
    this.mobileMoreMedia?.unload()
    this.desktopMoreMedia?.unload()
    this.mobileSwiper?.destroy()
    this.productThumbnailsScroller?.unload()
  }

  unload() {
    this._unloadMedia()
    this.productForm.destroy()
    this.accordions.forEach((accordion) => accordion.unload())
    this.optionButtons.destroy()
    this.quantityInput?.unload()
    this.events.forEach((unsubscribe) => unsubscribe())
    this.stickyScroll?.destroy()
    this.mobileMoreMedia?.unload()
    this.desktopMoreMedia?.unload()
    this.featuredProducts?.unload()
    this.variantAvailability?.unload()
    this.siblingProducts?.unload()
    this.giftCardRecipient?.unload()
    this.stickyAtcBar?.unload()
  }
}

export default Product
