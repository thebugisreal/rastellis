import('@/scripts/manualChunks/swiper.js').then(({ Swiper, Navigation, A11y }) => {
  document.addEventListener('rebuy:smartcart.ready', () => {
    window.rebuyRecommendedCarousel = () => {
      if (window.carouselInstance) {
        window.carouselInstance.destroy(true, true)
        window.carouselInstance = null
      }

      const recommendedWidgets = document.querySelectorAll(
        '.js-rebuy-recommended-widget',
      )

      if (!recommendedWidgets.length) return true

      recommendedWidgets.forEach((recommendedWidget) => {
        const swiperEl = recommendedWidget.querySelector('.js-rebuy-widget-carousel')
        const prevButtonEl = recommendedWidget.querySelector(
          '.js-swiper-navigation-prev',
        )
        const nextButtonEl = recommendedWidget.querySelector(
          '.js-swiper-navigation-next',
        )

        const slides = swiperEl?.querySelectorAll('.swiper-wrapper > .swiper-slide')

        if (!swiperEl || !slides?.length) return

        window.carouselInstance = new Swiper(swiperEl, {
          modules: [Navigation, A11y],
          a11y: true,
          slidesPerView: 1.3,
          spaceBetween: 8,
          threshold: 5,
          slidesOffsetBefore: slides.length > 2 ? 0 : 20,
          slidesOffsetAfter: slides.length > 2 ? 0 : 20,
          centeredSlides: slides.length > 2,
          loop: slides.length > 2,
          loopAdditionalSlides: 1,
          watchOverflow: true,
          preventClicks: true,
          preventClicksPropagation: true,
          navigation: {
            prevEl: prevButtonEl,
            nextEl: nextButtonEl,
          },
        })
      })

      return true
    }
  })

  document.addEventListener('rebuy:cart.change', () => {
    if (typeof window.rebuyRecommendedCarousel === 'function') {
      window.rebuyRecommendedCarousel()
    }
  })
})
