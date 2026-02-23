const VIDEO_MEDIA_SELECTOR = ".js-video-media"
const VIDEO_MEDIA_BUTTON_SELECTOR = ".js-button-video"

const VIDEO_PLAYED_CLASS = "played"

class VideoButton extends HTMLElement {
  constructor () {
    super()

    document.addEventListener("DOMContentLoaded", function () {
        const videoMediaEls = document.querySelectorAll(VIDEO_MEDIA_SELECTOR)

        videoMediaEls.length && videoMediaEls.forEach(videoMediaEl => {
            const videoEl = videoMediaEl.querySelector('video');
            const buttonPlayPause = videoMediaEl.querySelector(VIDEO_MEDIA_BUTTON_SELECTOR)
            if (videoEl && buttonPlayPause) {
                buttonPlayPause.addEventListener('click', (e) => {
                    e.preventDefault()

                    if (videoEl.paused) {
                        this.playVideo(videoEl, buttonPlayPause)
                    } else {
                        this.pauseVideo(videoEl, buttonPlayPause)
                    }

                    buttonPlayPause.setAttribute('aria-pressed', 'true')

                    setTimeout(function (){
                        buttonPlayPause.setAttribute('aria-pressed', 'false')
                    }, 500)
                })
            }
        });
    });
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

customElements.define('video-button', VideoButton)
