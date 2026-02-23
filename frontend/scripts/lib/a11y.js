import { qs, listen } from '@fluorescent/dom'

const {
  strings: { accessibility: strings },
} = window.theme

const handleTab = () => {
  let tabHandler = null
  const formElments = ['INPUT', 'TEXTAREA', 'SELECT']
  // Determine if the user is a mouse or keyboard user
  function handleFirstTab(e) {
    if (
      e.keyCode === 9 &&
      !formElments.includes(document.activeElement.tagName)
    ) {
      document.body.classList.add('user-is-tabbing')

      tabHandler()
      tabHandler = listen(window, 'mousedown', handleMouseDownOnce)
    }
  }

  function handleMouseDownOnce() {
    document.body.classList.remove('user-is-tabbing')

    tabHandler()
    tabHandler = listen(window, 'keydown', handleFirstTab)
  }

  tabHandler = listen(window, 'keydown', handleFirstTab)
}

const focusFormStatus = (node) => {
  const formStatus = qs('.form-status', node)

  if (!formStatus) return

  const focusElement = qs('[data-form-status]', formStatus)

  if (!focusElement) return

  focusElement.focus()
}

const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function backgroundVideoHandler(container) {
  const pause = qs('.video-pause', container)
  const video = container.getElementsByTagName('VIDEO')[0]

  if (!pause || !video) return

  const pauseVideo = () => {
    video.pause()
    pause.setAttribute('data-status', 'pause')

    const srOnlyEl = qs('.sr-only', pause)
    if (!srOnlyEl) return
    srOnlyEl.innerText = strings.play_video
  }

  const playVideo = () => {
    video.play()
    pause.setAttribute('data-status', 'play')

    const srOnlyEl = qs('.sr-only', pause)
    if (!srOnlyEl) return
    srOnlyEl.innerText = strings.pause_video
  }

  if (prefersReducedMotion()) {
    pauseVideo()
  }

  const pauseListener = listen(pause, 'click', (e) => {
    e.preventDefault()

    if (video.paused) {
      playVideo()
    } else {
      pauseVideo()
    }
  })

  return () => pauseListener()
}

export {
  handleTab,
  focusFormStatus,
  prefersReducedMotion,
  backgroundVideoHandler,
}
