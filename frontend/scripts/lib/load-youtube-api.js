let loaded = null

export default function loadYouTubeAPI() {
  // Loading was triggered by a previous call to function
  if (loaded !== null) return loaded

  // API has already loaded
  if (window.YT && window.YT.loaded) {
    loaded = Promise.resolve()
    return loaded
  }

  // Otherwise, load API
  loaded = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => {
      resolve()
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)
  })

  return loaded
}
