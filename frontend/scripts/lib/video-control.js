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

            buttonPlayPauseEl.setAttribute("aria-pressed", "true")

            setTimeout(function (){
                buttonPlayPauseEl.setAttribute("aria-pressed", "false")
            }, 500)
        })
    }
  }

    pauseVideo (video, button)  {
        video.pause()
        button.classList.remove(VIDEO_PLAYED_CLASS)
    }

    playVideo  (video, button)  {
        video.play()
        button.classList.add(VIDEO_PLAYED_CLASS)
    }
}

window.customElements.define("video-control", VideoControl)