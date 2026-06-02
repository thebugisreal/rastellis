const VIDEO_SELECTOR = ".js-video"
const VIDEO_MEDIA_BUTTON_SELECTOR = ".js-button-video"
const VIDEO_PLAYED_CLASS = "played"

class VideoControl extends HTMLElement {
  constructor () {
    super()

    const videoEl = this.querySelector(VIDEO_SELECTOR);
    const buttonPlayPauseEl = this.querySelector(VIDEO_MEDIA_BUTTON_SELECTOR);

    if (videoEl && buttonPlayPauseEl) {
        buttonPlayPauseEl.addEventListener("click", (e) => {
            e.preventDefault()

            if (videoEl.paused) {
                this.playVideo(videoEl, buttonPlayPauseEl)
            } else {
                this.pauseVideo(videoEl, buttonPlayPauseEl)
            }
        })

        videoEl.addEventListener("play", () => {
          buttonPlayPauseEl.setAttribute("aria-pressed", "true")
          buttonPlayPauseEl.classList.add(VIDEO_PLAYED_CLASS)
        })

        videoEl.addEventListener("pause", () => {
          buttonPlayPauseEl.setAttribute("aria-pressed", "false")
          buttonPlayPauseEl.classList.remove(VIDEO_PLAYED_CLASS)
        })

        buttonPlayPauseEl.setAttribute("aria-pressed", String(!videoEl.paused))
    }
  }

    pauseVideo (video, button)  {
        video.pause()
        button.classList.remove(VIDEO_PLAYED_CLASS)
        button.setAttribute("aria-pressed", "false")
    }

    playVideo  (video, button)  {
        video.play()
        button.classList.add(VIDEO_PLAYED_CLASS)
        button.setAttribute("aria-pressed", "true")
    }
}

window.customElements.define("video-control", VideoControl)
