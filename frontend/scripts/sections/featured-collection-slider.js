import section from '@/scripts/glow/section'
import { qs, qsa, listen, add, remove, contains } from '@fluorescent/dom'

import Carousel from '@/scripts/lib/carousel'
import ProductItem from '@/scripts/lib/product-item'
import animateListSlider from '@/scripts/lib/animation/list-slider'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  navItems: '.featured-collection-slider__navigation-list-item',
  sliderContainer: '.featured-collection-slider__content.carousel',
  navControls: '.featured-collection-slider__carousel-controls',
}

const classes = {
  selected: 'selected',
  visible: 'visible',
  fadeout: 'fadeout',
  initReveal: 'init-reveal',
  reveal: 'reveal',
}

section('featured-collection-slider', {
  onLoad() {
    this.events = []
    this.carousels = []
    this._initCarousels()

    if (shouldAnimate(this.container)) {
      this.animateListSlider = animateListSlider(this.container)
    }
  },

  _initCarousels() {
    const { productsPerView, mobileProductsPerView, showCarouselControls } =
      this.container.dataset
    const enableCarouselControls = showCarouselControls !== 'false'
    this.perView = parseInt(productsPerView, 10)
    const mobileColumns = parseFloat(mobileProductsPerView, 10)
    this.mobilePerView = Number.isInteger(mobileColumns)
      ? mobileColumns * 1.05
      : mobileColumns

    this.productItem = ProductItem(this.container)
    this.carouselsElements = qsa(selectors.sliderContainer, this.container)
    this.navItems = qsa(selectors.navItems, this.container)
    this.navControls = qsa(selectors.navControls, this.container)

    this.navItems.forEach((button) =>
      this.events.push(
        listen(button, 'click', this._handleNavButton.bind(this)),
      ),
    )

    this.carouselsElements.forEach((container, index) => {
      const navigationWrapper = qs(
        `[data-navigation="${index}"]`,
        this.container,
      )
      const nextButton = enableCarouselControls
        ? qs('[data-next]', navigationWrapper)
        : null
      const prevButton = enableCarouselControls
        ? qs('[data-prev]', navigationWrapper)
        : null
      const paginationEl = enableCarouselControls
        ? qs('.swiper-pagination', navigationWrapper)
        : null

      const carouselOptions = {
        slidesPerView: this.mobilePerView,
        spaceBetween: 16, // matches product grid
        breakpoints: {
          720: {
            spaceBetween: 24, // matches product grid
            slidesPerView:
              this.perView === 5 ? this.perView - 1 : this.perView,
          },
          1200: {
            spaceBetween: 32, // matches product grid
            slidesPerView: this.perView,
          },
        },
      }

      if (enableCarouselControls && nextButton && prevButton) {
        carouselOptions.navigation = {
          nextEl: nextButton,
          prevEl: prevButton,
        }
      }

      if (enableCarouselControls && paginationEl) {
        carouselOptions.pagination = {
          el: paginationEl,
          clickable: true,
        }
      }

      this.carousels.push(Carousel(container, carouselOptions))
    })
  },

  _handleNavButton(e) {
    e.preventDefault()
    const { navigationItem } = e.currentTarget.dataset

    if (!contains(e.currentTarget, classes.selected)) {
      this._hideAll()
      this._show(parseInt(navigationItem, 10))
    }
  },

  _hideAll() {
    remove(this.navItems, classes.selected)
    remove(this.navControls, classes.visible)

    remove(this.carouselsElements, classes.initReveal)
    remove(this.carouselsElements, classes.reveal)

    if (shouldAnimate(this.container)) {
      add(this.carouselsElements, classes.fadeout)
      setTimeout(() => {
        remove(this.carouselsElements, classes.visible)
      }, 300)
    } else {
      remove(this.carouselsElements, classes.visible)
    }
  },

  _show(index) {
    const collection = qs(`[data-collection="${index}"]`, this.container)

    if (this.navControls.length) {
      const navigationWrapper = qs(
        `[data-navigation="${index}"]`,
        this.container,
      )
      add(navigationWrapper, classes.visible)
    }

    if (this.navItems.length) {
      const navigationItem = qs(
        `[data-navigation-item="${index}"]`,
        this.container,
      )
      add(navigationItem, classes.selected)
    }

    if (shouldAnimate(this.container)) {
      add(collection, classes.fadeout)
      add(collection, classes.initReveal)
      setTimeout(() => {
        add(collection, classes.visible)
        remove(collection, classes.fadeout)
        setTimeout(() => {
          add(collection, classes.reveal)
        }, 50)
      }, 300)
    } else {
      add(collection, classes.visible)
    }
  },

  onUnload() {
    this.carousels.forEach((swiper) => swiper.destroy())
    this.animateListSlider?.destroy()
    this.events.forEach((unsubscribe) => unsubscribe())
  },

  onBlockSelect({ target }) {
    const { collection } = target.dataset
    this._hideAll()
    this._show(parseInt(collection, 10))
  },
})
