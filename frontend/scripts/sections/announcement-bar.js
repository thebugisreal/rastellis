import { qs, qsa, add } from '@fluorescent/dom'
import section from '@/scripts/glow/section'
import getMediaQuery from '@/scripts/lib/media-queries'
import atBreakpointChange from '@/scripts/lib/at-breakpoint-change'

const selectors = {
  slider: '[data-slider]',
  slide: '[data-slider] [data-slide]',
  navPrev: '.slider-nav-button-prev',
  navNext: '.slider-nav-button-next',
  mobileOnlyInner: '.announcement-bar__item-inner-mobile-only',
  desktopOnlyInner: '.announcement-bar__item-inner-desktop-only',
}

section('announcement-bar', {
  setHeightVariable() {
    if (this.container.offsetHeight !== this.lastSetHeight) {
      document.documentElement.style.setProperty(
        '--announcement-height',
        `${this.container.offsetHeight}px`,
      )
      this.lastSetHeight = this.container.offsetHeight
    }
  },

  onLoad() {
    const { enableStickyAnnouncementBar } = this.container.dataset

    // This is done here AND in an inline script so it's responsive in the theme editor before this JS is loaded.
    document.documentElement.setAttribute(
      'data-enable-sticky-announcement-bar',
      enableStickyAnnouncementBar,
    )
    this.setHeightVariable()
    this.widthWatcher = () => {
      this.setHeightVariable()
    }
    window.addEventListener('resize', this.widthWatcher)

    this.disableTabbingToInners = function () {
      // Disable tabbing on items that aren't shown
      const desktopOnlyInners = qsa(selectors.desktopOnlyInner, this.container)
      const mobileOnlyInners = qsa(selectors.mobileOnlyInner, this.container)
      const desktopIsMobileSize = window.matchMedia(
        getMediaQuery('below-720'),
      ).matches

      desktopOnlyInners.forEach((inner) => {
        inner.toggleAttribute('inert', desktopIsMobileSize)
      })

      mobileOnlyInners.forEach((inner) => {
        inner.toggleAttribute('inert', !desktopIsMobileSize)
      })
    }

    this.sliderContainer = qs(selectors.slider, this.container)
    this.slides = qsa(selectors.slide, this.container)
    this.navPrev = qsa(selectors.navPrev, this.container)
    this.navNext = qsa(selectors.navNext, this.container)
    this.disableTabbingToInners()
    this.breakPointHandler = atBreakpointChange(720, () => {
      this.disableTabbingToInners()
    })
    this.autoplayToggleButton = qs('.js-action-button', this.container)


    if (this.slides.length < 2) {
      return null
    }

    const autoplayEnabled =
      this.sliderContainer.dataset.autoplayEnabled == 'true'
    const autoplayDelay = parseInt(
      this.sliderContainer.dataset.autoplayDelay,
      10,
    )
    let _this = this
    import('@/scripts/manualChunks/swiper.js').then(
      ({ Swiper, Navigation, Autoplay }) => {
        this.swiper = new Swiper(this.sliderContainer, {
          on: {
            init() {
              add(_this.container, 'slider-active')
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
          modules: [Navigation, Autoplay],
          grabCursor: true,
          loop: true,

          autoplay: autoplayEnabled
            ? {
                delay: autoplayDelay,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false,
          navigation: {
            nextEl: this.navNext,
            prevEl: this.navPrev,
          },
          allowTouchMove: false,
        })

        this.swiper.unsetGrabCursor();

        if (this.autoplayToggleButton) {
          let isPaused = false;

          this.autoplayToggleButton.addEventListener('click', () => {
            if (isPaused) {
              this.swiper.autoplay.start()
              this.autoplayToggleButton.setAttribute('aria-pressed', 'false')
              this.autoplayToggleButton.setAttribute('aria-label', 'Pause carousel')
              this.autoplayToggleButton.classList.remove('paused')
            } else {
              this.swiper.autoplay.stop()
              this.autoplayToggleButton.setAttribute('aria-pressed', 'true')
              this.autoplayToggleButton.setAttribute('aria-label', 'Play carousel')
              this.autoplayToggleButton.classList.add('paused')
            }
            isPaused = !isPaused
          });
        }
      },
    )
  },

  onBlockSelect({ target: slide }) {
    const index = parseInt(slide.dataset.index, 10)
    this.swiper?.autoplay?.stop()
    this.swiper?.slideToLoop(index)
  },

  onBlockDeselect() {
    this.swiper?.autoplay?.start()
  },

  onUnload() {
    this.swiper?.destroy()
    window.removeEventListener('resize', this.widthWatcher)
  },
})
