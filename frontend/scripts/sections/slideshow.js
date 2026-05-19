import { qs, qsa, listen, contains, add, remove } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import { on } from 'evx'
import { emit } from 'evx'
import { prefersReducedMotion } from '@/scripts/lib/a11y'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const classes = {
  activeDot: 'slideshow-navigation__dot--active',
  navigationLoader: 'slideshow-navigation__dot-loader',
}

const selectors = {
  slide: '[data-slide]',
  swiper: '.swiper',
  navigationDots: '.slideshow-navigation__dots',
  navigationDot: '.slideshow-navigation__dot',
  navigationLoader: '.slideshow-navigation__dot-loader',
  animatableItems: '.animation--section-blocks > *',
  pageFooter: 'footer',
}

section('slideshow', {
  onLoad() {
    this.events = []
    this.enableAutoplay = this.container.dataset.enableAutoplay
    this.autoplayDuration = this.container.dataset.autoplay
    this.pageFooter = qs(selectors.pageFooter, document)
    this.slideshow = null
    this.slideshowContainer = qs(selectors.swiper, this.container)
    this.slides = qsa(selectors.slide, this.container)
    this.events.push(
      listen(this.container, 'focusin', () => this.handleFocus()),
    )

    if (shouldAnimate(this.container)) {
      this.slideAnimations = this.slides.map((slide) =>
        delayOffset(slide, [selectors.animatableItems], 3),
      )
      this.observer = intersectionWatcher(this.container)
    }

    if (this.slides.length > 1) {
      import('@/scripts/manualChunks/swiper.js').then(
        ({
          Swiper,
          Autoplay,
          Pagination,
          EffectFade,
          EffectCreative,
        }) => {
          const swiperOptions = {
            modules: [Pagination],
            autoHeight: true,
            slidesPerView: 1,
            grabCursor: true,
            effect: 'fade',
            fadeEffect: {
              crossFade: false,
            },
            watchSlidesProgress: true,
            loop: true,
            preloadImages: false, // if this is true, it negates benefits of lazyloading
            pagination: {
              el: selectors.navigationDots,
              clickable: true,
              bulletActiveClass: classes.activeDot,
              bulletClass: 'slideshow-navigation__dot',
              renderBullet: (_, className) => `
                <button class="${className}" type="button">
                  <div class="slideshow-navigation__dot-loader"></div>
                </button>`,
            },
            on: {
              afterInit: () => {
                this.handleBulletLabels()
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
          }

          if (this.enableAutoplay === 'true') {
            swiperOptions.modules.push(Autoplay)
            swiperOptions.autoplay = {
              delay: this.autoplayDuration,
              disableOnInteraction: false,
            }

            this.autoplayObserver = new IntersectionObserver(
              ([{ isIntersecting: visible }]) => {
                if (visible) {
                  this.playSlideshow()
                } else {
                  this.pauseSlideshow()
                }
              },
            )

            this.footerObserver = new IntersectionObserver(
              ([{ isIntersecting: visible }]) => {
                if (visible) {
                  this.autoplayObserver.disconnect()
                  this.pauseSlideshow()
                } else {
                  this.autoplayObserver.observe(this.slideshowContainer)
                }
              },
              { threshold: 0.8 },
            )

            // blocking this function within 2 levels of iframes allows for the section preview to show and animate in the theme editor
            if (window.frames < 2) {
              this.footerObserver.observe(this.pageFooter)
            }
          }

          if (!prefersReducedMotion()) {
            swiperOptions.modules.push(EffectFade)
            swiperOptions.effect = 'fade'
            swiperOptions.fadeEffect = {
              crossFade: false,
            }
          } else {
            swiperOptions.modules.push(EffectCreative)
            swiperOptions.effect = 'creative'
            swiperOptions.creativeEffect = {
              prev: {
                opacity: 0.99,
              },
              next: {
                opacity: 1,
              },
            }
          }

          this.slideshow = new Swiper(this.slideshowContainer, swiperOptions)
          this.navigationLoaderEls = qsa(
            selectors.navigationLoader,
            this.container,
          )
          emit('slideshow:initialized')
        },
      )
    }
  },

  resetLoaderAnimation(loader) {
    remove(loader, classes.navigationLoader)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // double RAF lets the document recompute styles
        add(loader, classes.navigationLoader)
      })
    })
  },

  pauseSlideshow() {
    this.slideshow.autoplay.stop()
    this.navigationLoaderEls.forEach((loader) => {
      loader.style.animationPlayState = 'paused'
    })
  },

  playSlideshow() {
    this.slideshow?.autoplay.start()
    this.navigationLoaderEls.forEach((loader) => {
      this.resetLoaderAnimation(loader)
      loader.style.animationPlayState = 'running'
    })
  },

  handleFocus() {
    if (contains(document.body, 'user-is-tabbing')) {
      this.pauseSlideshow()
    }
  },

  handleBulletLabels() {
    const bullets = qsa(selectors.navigationDot, this.container)

    bullets.forEach((bullet, index) => {
      const associatedSlide = this.slides[index]
      const { bulletLabel } = associatedSlide.dataset
      bullet.setAttribute('aria-label', bulletLabel)
    })
  },

  handleBlockSelect(slideIndex) {
    this.slideshow.slideTo(parseInt(slideIndex, 10))
    this.pauseSlideshow()
  },

  handleBlockDeselect() {
    this.playSlideshow()
  },

  onBlockSelect({ target }) {
    const { slide } = target.dataset

    if (this.slideshow) {
      this.handleBlockSelect(slide)
    } else {
      // Listen for initalization if slideshow does not exist
      this.events.push(
        on('slideshow:initialized', () => {
          this.handleBlockSelect(slide)
        }),
      )
    }
  },

  onBlockDeselect() {
    if (this.slideshow) {
      this.handleBlockDeselect()
    } else {
      // Listen for initalization if slideshow does not exist
      this.events.push(
        on('slideshow:initialized', () => {
          this.handleBlockDeselect()
        }),
      )
    }
  },

  onUnload() {
    this.slideshow?.destroy()
    this.events.forEach((unsubscribe) => unsubscribe())
    this.observer?.destroy()
    this.autoplayObserver?.disconnect()
    this.footerObserver?.disconnect()
  },
})
