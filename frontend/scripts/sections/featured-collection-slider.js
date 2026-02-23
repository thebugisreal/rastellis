import section from '@/scripts/glow/section'
import { qs, qsa, listen, add, remove, contains } from '@fluorescent/dom'
import { emit, on } from 'evx'

import Carousel from '@/scripts/lib/carousel'
import ProductItem from '@/scripts/lib/product-item'
import animateListSlider from '@/scripts/lib/animation/list-slider'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  navItems: '.featured-collection-slider__navigation-list-item',
  sliderContainer: '.carousel',
  navButtons: '.carousel__navigation-buttons',
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
    const { productsPerView, mobileProductsPerView } = this.container.dataset
    this.perView = parseInt(productsPerView, 10)
    this.mobilePerView = parseInt(mobileProductsPerView, 10) * 1.05
    // 1.05 factor gives us a "peek" without CSS hacks
    // TODO: encapsulate this in carousel instead of duplication wherever
    // we call on carousel.  Can also simplify the config that we pass in
    // to something like perViewSmall, perViewMedium, perViewLarge and same with
    // spaceBetween?

    this.productItem = ProductItem(this.container)
    this.carouselsElements = qsa(selectors.sliderContainer, this.container)
    this.navItems = qsa(selectors.navItems, this.container)
    this.navigationButtons = qsa(selectors.navButtons, this.container)

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
      const nextButton = qs('[data-next]', navigationWrapper)
      const prevButton = qs('[data-prev]', navigationWrapper)

      this.carousels.push(
        Carousel(container, {
          slidesPerView: this.mobilePerView,
          spaceBetween: 13, // matches product grid
          navigation: {
            nextEl: nextButton,
            prevEl: prevButton,
          },
          breakpoints: {
            720: {
              spaceBetween: 17, // matches product grid
              slidesPerView:
                this.perView === 5 ? this.perView - 1 : this.perView,
            },
            1200: {
              spaceBetween: 25, // matches product grid
              slidesPerView: this.perView,
            },
          },
        }),
      )
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
    remove(this.navigationButtons, classes.visible)

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
    const navigationWrapper = qs(`[data-navigation="${index}"]`, this.container)
    add(navigationWrapper, classes.visible)
    const collection = qs(`[data-collection="${index}"]`, this.container)

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
