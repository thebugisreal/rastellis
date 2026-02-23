import { qs, qsa, listen, add, remove } from '@fluorescent/dom'
import section from '@/scripts/glow/section'
import ProductCardVideo from '@/scripts/lib/product-card-video'
import animateListSlider from '@/scripts/lib/animation/video-reels'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  slide: '[data-swiper-slide]',
  carousel: '[data-swiper]',
  navigationPrev: '[data-prev]',
  navigationNext: '[data-next]',
  pagination: '[data-pagination]',
  videoControls: 'video-controls',
  video: 'video',
  soundToggle: '[data-btn-sound]',
  playPauseBtn: '[data-btn-play-pause]',
  playIcon: '.video-reels__item-icon-play',
  pauseIcon: '.video-reels__item-icon-pause',
  volumeIcon: '.volume-icon',
  volumeMutedIcon: '.volume-muted-icon'
}

const classes = {
  grid: 'video-reels--grid',
  gridItem: 'video-reels__grid-item',
  hidden: 'hidden',
  active: 'swiper-slide-active'
}

section('video-reels', {
  onLoad() {
    this._initProperties()
    this._initLayout()
    this._initVideoControls()
    this._initProductCards()

    if (shouldAnimate(this.container)) {
      this.animateListSlider = animateListSlider(this.container)
    }
  },

  _initProperties() {
    this.slides = qsa(selectors.slide, this.container)
    this.navigationPrevEl = qs(selectors.navigationPrev, this.container)
    this.navigationNextEl = qs(selectors.navigationNext, this.container)
    this.paginationEl = qs(selectors.pagination, this.container)
    this.swiper = null
    this.enableCarousel = this.container.dataset.enableCarousel === 'true'
    this.currentVideo = null
    this.events = []
  },

  _initLayout() {
    if (this.slides.length > 0) {
      if (this.enableCarousel && this.slides.length > 1) {
        this._initCarousel()
      } else {
        this._initGrid()
      }
    }
  },

  _initCarousel() {
    import('@/scripts/manualChunks/swiper.js').then(({ Swiper, Navigation, Pagination }) => {
      const swiperContainer = qs(selectors.carousel, this.container)
      if (!swiperContainer) return

      const swiperOptions = {
        modules: [Navigation, Pagination],
        slidesPerView: 1.35,
        spaceBetween: 16,
        freeMode: false,
        speed: 150,
        grabCursor: false,
        centeredSlides: true,
        loop: true,
        slideToClickedSlide: true,
        breakpoints: {
          600: { slidesPerView: 1.75 },
          900: { slidesPerView: 2.5 },
          1200: {
            slidesPerView: 4.5,
            spaceBetween: 24
          }
        },
        navigation: {
          nextEl: this.navigationNextEl,
          prevEl: this.navigationPrevEl
        },
        pagination: {
          el: this.paginationEl,
          clickable: true
        },
        on: {
          init: (swiper) => {
            const activeSlide = swiper.slides[swiper.activeIndex]
            this._playVideoInSlide(activeSlide)
          },
          slideChange: (swiper) => {
            this._pauseAllVideos()
            const activeSlide = swiper.slides[swiper.activeIndex]
            this._playVideoInSlide(activeSlide)
          }
        }
      }

      this.swiper = new Swiper(swiperContainer, swiperOptions)
    })
  },

  _pauseAllVideos() {
    qsa(selectors.video, this.container).forEach(video => {
      video.pause()
    })
  },

  _playVideoInSlide(slide) {
    if (!this.enableCarousel) return

    const videoControls = qs(selectors.videoControls, slide)
    if (!videoControls) return

    const video = qs(selectors.video, videoControls)
    const playPauseBtn = qs(selectors.playPauseBtn, videoControls)

    if (!video || !playPauseBtn) return

    const playIcon = qs(selectors.playIcon, playPauseBtn)
    const pauseIcon = qs(selectors.pauseIcon, playPauseBtn)

    video.play()
    add(playIcon, classes.hidden)
    remove(pauseIcon, classes.hidden)
    playPauseBtn.dataset.state = 'play'
    this.currentVideo = video
  },

  _initGrid() {
    this.container.setAttribute('data-slide-count', this.slides.length)

    add(this.container, classes.grid)
    qsa(selectors.slide, this.container).forEach(slide => {
      remove(slide, 'swiper-slide')
      add(slide, classes.gridItem)
    })

    qsa('.video-reels__item-product', this.container).forEach(product => {
      remove(product, 'hidden')
    })

    add(this.navigationNextEl, 'hidden')
    add(this.navigationPrevEl, 'hidden')
    add(this.paginationEl, 'hidden')
  },

  _initVideoControls() {
    const videoControls = qsa(selectors.videoControls, this.container)
    videoControls.forEach(control => {
      const video = qs(selectors.video, control)
      if (!video) return

      if (!this.enableCarousel) {
        const playPauseBtn = qs(selectors.playPauseBtn, control)
        const soundToggle = qs(selectors.soundToggle, control)
        if (playPauseBtn) remove(playPauseBtn, 'hidden')
        if (soundToggle) remove(soundToggle, 'hidden')
      }

      this._initPlayPauseControl(control, video)
      this._initSoundControl(control, video)
    })
  },

  _initPlayPauseControl(control, video) {
    const playPauseBtn = qs(selectors.playPauseBtn, control)
    if (!playPauseBtn) return

    const playIcon = qs(selectors.playIcon, playPauseBtn)
    const pauseIcon = qs(selectors.pauseIcon, playPauseBtn)

    const togglePlayPause = (e) => {
      e.preventDefault()
      if (video.paused || video.ended) {
        video.play()
        add(playIcon, classes.hidden)
        remove(pauseIcon, classes.hidden)
        playPauseBtn.dataset.state = 'play'
      } else {
        video.pause()
        remove(playIcon, classes.hidden)
        add(pauseIcon, classes.hidden)
        playPauseBtn.dataset.state = 'pause'
      }
    }

    // Set initial state based on video state
    if (video.paused || video.ended) {
      remove(playIcon, classes.hidden)
      add(pauseIcon, classes.hidden)
      playPauseBtn.dataset.state = 'pause'
    } else {
      add(playIcon, classes.hidden)
      remove(pauseIcon, classes.hidden)
      playPauseBtn.dataset.state = 'play'
    }

    this.events.push(
      listen(playPauseBtn, 'click', togglePlayPause),
      listen(video, 'play', () => {
        add(playIcon, classes.hidden)
        remove(pauseIcon, classes.hidden)
        playPauseBtn.dataset.state = 'play'
      }),
      listen(video, 'pause', () => {
        remove(playIcon, classes.hidden)
        add(pauseIcon, classes.hidden)
        playPauseBtn.dataset.state = 'pause'
      })
    )
  },

  _initSoundControl(control, video) {
    const soundToggle = qs(selectors.soundToggle, control)
    if (!soundToggle) return

    const volumeIcon = qs(selectors.volumeIcon, soundToggle)
    const volumeMutedIcon = qs(selectors.volumeMutedIcon, soundToggle)

    const toggleSound = () => {
      const isMuted = video.muted
      video.muted = !isMuted
      soundToggle.dataset.sound = isMuted ? 'on' : 'off'

      if (isMuted) {
        add(volumeIcon, classes.hidden)
        remove(volumeMutedIcon, classes.hidden)
      } else {
        remove(volumeIcon, classes.hidden)
        add(volumeMutedIcon, classes.hidden)
      }
    }

    // Set initial state based on video muted state
    if (video.muted) {
      remove(volumeIcon, classes.hidden)
      add(volumeMutedIcon, classes.hidden)
      soundToggle.dataset.sound = 'off'
    } else {
      add(volumeIcon, classes.hidden)
      remove(volumeMutedIcon, classes.hidden)
      soundToggle.dataset.sound = 'on'
    }

    this.events.push(listen(soundToggle, 'click', toggleSound))
  },

  _initProductCards() {
    this.productCardVideo = ProductCardVideo(this.container)
  },

  onUnload() {
    this.swiper?.destroy()
    this.events.forEach(unsubscribe => unsubscribe())
    this.productCardVideo?.unload()
    this.animateListSlider?.destroy()
  }
})