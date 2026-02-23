import section from '@/scripts/glow/section'
import { add, contains, listen, qs, qsa, remove } from '@fluorescent/dom'
import getMediaQuery from '@/scripts/lib/media-queries'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import { emit } from 'evx'
import cart from '@/scripts/glow/cart'
import animateShoppableImage from '@/scripts/lib/animation/shoppable-image'
import animateShoppableFeature from '@/scripts/lib/animation/shoppable-feature'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import atBreakpointChange from '@/scripts/lib/at-breakpoint-change'

const selectors = {
  hotspotWrappers: '.shoppable-item',
  hotspots: '.shoppable-item__hotspot',
  productCard: '.shoppable-item__product-card',
  mobileDrawer: '.shoppable-feature-mobile-drawer',
  desktopSliderContainer: '.shoppable-feature__secondary-content',
  slider: '.swiper',
  slide: '.swiper-slide',
  sliderPagination: '.swiper-pagination',
  sliderImages: '.product-card-mini__image img',
  imageContainer: '.shoppable__image-container',
  sliderNavPrev: '.slider-nav-button-prev',
  sliderNavNext: '.slider-nav-button-next',
  drawerBackground: '.mobile-drawer__overlay',
  drawerCloseButton: '.mobile-drawer__close',
  quickAddButton: '[data-quick-shop-trigger="quick-add"]',
  quickViewButton: '[data-quick-shop-trigger="quick-view"]',
  quickCart: '.quick-cart',
  purchaseConfirmation: '.purchase-confirmation-popup',
}

const classes = {
  animating: 'shoppable-item--animating',
  unset: 'shoppable-item--position-unset',
  hidden: 'hidden',
  active: 'active',
  drawerActive: 'active',
  pulse: 'shoppable-item__hotspot--pulse',
}

const sliderTypes = {
  Desktop: 'desktop',
  Mobile: 'mobile',
}

section('shoppable', {
  onLoad() {
    this.imageContainer = qs(selectors.imageContainer, this.container)
    this.showHotspotCards = this.container.dataset.showHotspotCards === 'true'
    this.productCards = qsa(selectors.productCard, this.container)
    this.hotspotContainers = qsa(selectors.hotspotWrappers, this.container)
    this.hotspots = qsa(selectors.hotspots, this.container)
    this.mobileDrawer = qs(selectors.mobileDrawer, this.container)
    this.quickAddButtons = qsa(selectors.quickAddButton, this.container)
    this.quickViewButtons = qsa(selectors.quickViewButton, this.container)
    this.purchaseConfirmation = qs(selectors.purchaseConfirmation, document)
    this.quickCart = qs(selectors.quickCart, document)

    // Self terminating mouseenter events
    this.hotspotEvents = this.hotspots.map((hotspot) => {
      return {
        element: hotspot,
        event: listen(hotspot, 'mouseenter', (e) => {
          remove(e.currentTarget.parentNode, classes.animating)
          this.hotspotEvents.find((o) => o.element === hotspot).event()
        }),
      }
    })

    this.events = [
      listen(this.hotspots, 'click', (e) => this._hotspotClickHandler(e)),
      listen(this.container, 'keydown', ({ keyCode }) => {
        if (keyCode === 27) this._closeAll()
      }),

      listen(this.quickAddButtons, 'click', (e) => {
        const buttonEl = e.currentTarget
        add(buttonEl, 'loading')

        // if quick cart and confirmation popup are disabled, use standard form submit
        if (!purchaseConfirmation && !quickCart) return

        e.preventDefault()
        e.stopPropagation()

        const { productId } = buttonEl.dataset
        if (!productId) return

        cart.addItemById(productId, 1).then(({ res }) => {
          remove(buttonEl, 'loading')

          if (this.purchaseConfirmation) {
            emit('confirmation-popup:open', null, { product: res.items[0] })
          } else {
            emit('quick-cart:updated')
            // Need a delay to allow quick-cart to refresh
            setTimeout(() => {
              emit('quick-cart:open')
            }, 300)
          }

          if (window.matchMedia(getMediaQuery('below-960')).matches) {
            this._closeAll()
          }
        })
      }),

      listen(this.quickViewButtons, 'click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const buttonEl = e.currentTarget
        const { productUrl } = buttonEl.dataset
        if (!productUrl) return

        emit('quick-view:open', null, {
          productUrl: productUrl,
        })

        if (window.matchMedia(getMediaQuery('below-960')).matches) {
          this._closeAll()
        }
      }),
    ]

    if (this.mobileDrawer) {
      this._setupDrawer()
    }
    this._createOrRecreateSlider()

    this.breakPointHandler = atBreakpointChange(960, () => {
      this._closeAll()
    })

    let previousWidth = window.innerWidth
    this.widthWatcher = () => {
      const currentWidth = window.innerWidth
      const wasAboveBreakpoint = previousWidth >= 960,
        isAboveBreakpoint = currentWidth >= 960
      if (wasAboveBreakpoint !== isAboveBreakpoint) {
        this._createOrRecreateSlider()
      }

      previousWidth = currentWidth
    }

    window.addEventListener('resize', this.widthWatcher)

    if (this.showHotspotCards) {
      this.events.push(
        listen(document, 'click', (e) => this._clickOutsideHandler(e)),
      )

      // Predefine product card dimensions
      this.productCards.forEach((card) => this._setCardDimensions(card))

      if (shouldAnimate(this.container)) {
        this.animateShoppableImage = animateShoppableImage(this.container)
      }

      // Show the first hotspot as active if showing as card and above drawer
      // showing screen width
      if (
        window.matchMedia(getMediaQuery('above-960')).matches &&
        this.hotspots.length
      ) {
        this._activateHotspot(0)
      }
    } else {
      if (shouldAnimate(this.container)) {
        this.animateShoppableFeature = animateShoppableFeature(this.container)
      }
    }

    if (!this.hotspots.length) return
    this._initPulseLoop()
  },

  _initPulseLoop() {
    const hotspots = qsa(selectors.hotspots, this.container)
    let pulseIndex = 0

    this.pulseInterval = setInterval(() => {
      remove(hotspots, classes.pulse)
      setTimeout(() => {
        add(hotspots[pulseIndex], classes.pulse)
        pulseIndex++
        if (pulseIndex >= hotspots.length) {
          pulseIndex = 0
        }
      }, 0)
    }, 3000)
  },

  _createOrRecreateSlider() {
    // This creates or recreates either a mobile or desktop slider as necessary
    const sliderType = window.matchMedia(getMediaQuery('above-960')).matches
      ? sliderTypes.Desktop
      : sliderTypes.Mobile

    if (this.sliderType !== sliderType) {
      this.sliderType = sliderType
      this.swiper?.destroy()
      this.sliderInitalized = false
      const sliderContainerDesktop = qs(selectors.desktopSliderContainer, this.container)
      const isHideHotspots = JSON.parse(sliderContainerDesktop.dataset.hideHotspots)
      const sliderContainerSelector =
        sliderType === sliderTypes.Desktop
          ? selectors.desktopSliderContainer
          : isHideHotspots ? selectors.desktopSliderContainer : selectors.mobileDrawer

      this.sliderContainer = qs(sliderContainerSelector, this.container)
      if (this.sliderContainer === null) return

      this.slider = qs(selectors.slider, this.sliderContainer)
      this.slides = qsa(selectors.slide, this.sliderContainer)
      this.sliderPagination = qs(
        selectors.sliderPagination,
        this.sliderContainer,
      )
      this.sliderNavNext = qs(selectors.sliderNavNext, this.sliderContainer)
      this.sliderNavPrev = qs(selectors.sliderNavPrev, this.sliderContainer)
      this.sliderImages = qsa(selectors.sliderImages, this.sliderContainer)

      if (this.slides.length < 2) {
        return
      }
      const _this = this
      import('@/scripts/manualChunks/swiper.js').then(
        ({ Swiper, Navigation, Pagination }) => {
          this.swiper = new Swiper(this.slider, {
            modules: [Navigation, Pagination],
            grabCursor: window.matchMedia(getMediaQuery('below-960')).matches,
            slidesPerView: 1,
            watchSlidesProgress: true,
            loop: true,
            navigation: {
              nextEl: this.sliderNavNext,
              prevEl: this.sliderNavPrev,
            },
            pagination: {
              el: this.sliderPagination,
              type: 'fraction',
            },
            on: {
              sliderFirstMove: function () {
                _this.sliderHasBeenInteractedWith = true
              },
              activeIndexChange: function (swiper) {
                if (isHideHotspots) return
                const index = swiper.realIndex
                _this.sliderInitalized && _this._indicateActiveHotspot(index)
              },
              afterInit: function () {
                _this.sliderInitalized = true
                _this.sliderImages?.forEach((image) =>
                  image.setAttribute('loading', 'eager'),
                )
                if (isHideHotspots) return
                if (_this.sliderType !== sliderTypes.Mobile) {
                  _this._indicateActiveHotspot(0)
                }
              },
              slideChangeTransitionEnd() {
                const slideEls = this.slides
                setTimeout(function () {
                  slideEls.forEach((slide) => {
                    slide.toggleAttribute(
                      'inert',
                      !slide.classList.contains('swiper-slide-active'),
                    )
                  })
                }, 50)
              },
            },
          })
        },
      )
    }
  },

  _indicateActiveHotspot(index) {
    this.hotspotContainers.forEach((spot) => remove(spot, classes.active))
    const dotWrapper = qs(
      `.shoppable-item[data-index='${index}']`,
      this.container,
    )
    add(dotWrapper, classes.active)
  },

  _activateHotspot(index) {
    const wrapper = qs(`.shoppable-item[data-index='${index}']`, this.container)
    const card = qs(selectors.productCard, wrapper)

    if (card && !window.matchMedia(getMediaQuery('below-960')).matches) {
      if (contains(card, 'hidden')) {
        this._closeAll()
        this._showCard(card)
        this._indicateActiveHotspot(index)
      } else {
        this._hideCard(card)
      }
    } else {
      if (this.swiper) {
        const isMobileSwiper = this.sliderType === sliderTypes.Mobile
        this.swiper.slideToLoop(index, isMobileSwiper ? 0 : undefined)
        if (isMobileSwiper) {
          this._openDrawer()
        }
      } else {
        if (window.matchMedia(getMediaQuery('below-960')).matches) {
          this._openDrawer()
        }
      }
    }
  },

  _showCard(card) {
    this._setCardDimensions(card)
    card.setAttribute('aria-hidden', false)
    remove(card, classes.hidden)
  },

  _hideCard(card) {
    card.setAttribute('aria-hidden', true)
    add(card, classes.hidden)
    // remove(wrapper, classes.active);
  },

  _setCardDimensions(card) {
    const cardHeight = card.offsetHeight
    const cardWidth = card.offsetWidth
    card.style.setProperty('--card-height', cardHeight + 'px')
    card.style.setProperty('--card-width', cardWidth + 'px')
  },

  _setupDrawer() {
    // TODO: should this and open/close drawer functions be moved to their own file?

    const drawerBackground = qs(selectors.drawerBackground, this.container)
    const drawerCloseButton = qs(selectors.drawerCloseButton, this.container)

    this.events.push(listen(drawerBackground, 'click', () => this._closeAll()))
    this.events.push(listen(drawerCloseButton, 'click', () => this._closeAll()))
  },

  _openDrawer() {
    add(this.mobileDrawer, classes.drawerActive)
    document.body.setAttribute('data-fluorescent-overlay-open', 'true')
    disableBodyScroll(this.mobileDrawer)
  },

  _closeDrawer() {
    if (this.mobileDrawer) {
      remove(this.mobileDrawer, classes.drawerActive)
      document.body.setAttribute('data-fluorescent-overlay-open', 'false')
      enableBodyScroll(this.mobileDrawer)
    }
  },

  _hotspotClickHandler(e) {
    const wrapper = e.currentTarget.parentNode.parentNode
    const hotspotIndex = parseInt(wrapper.dataset.index, 10)
    this._activateHotspot(hotspotIndex)
  },

  _clickOutsideHandler(e) {
    if (
      !e.target.closest(selectors.productCard) &&
      !contains(e.target, 'shoppable-item__hotspot') &&
      !window.matchMedia(getMediaQuery('below-960')).matches
    ) {
      this._closeAll()
    }
  },

  _closeAll() {
    this.productCards.forEach((card) => {
      this._hideCard(card)
    })
    this.hotspotContainers.forEach((spot) => remove(spot, classes.active))
    this._closeDrawer()
  },

  onBlockDeselect() {
    this._closeAll()
  },

  onBlockSelect({ target: el }) {
    const index = parseInt(el.dataset.index, 10)

    if (window.matchMedia(getMediaQuery('below-960')).matches) {
      setTimeout(() => {
        this._activateHotspot(index)
      }, 10)
    } else {
      if (this.swiper) {
        this.swiper.slideToLoop(index)
      } else {
        this._activateHotspot(index)
      }
    }
  },

  onUnload() {
    this.swiper?.destroy()
    window.removeEventListener('resize', this.widthWatcher)
    this.events.forEach((unsubscribe) => unsubscribe())
    this.animateShoppableImage?.destroy()
    this.animateShoppableFeature?.destroy()
    this.pulseInterval && clearInterval(this.pulseInterval)
  },
})
