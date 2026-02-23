let loaded = null

export default function loadVimeoAPI() {
  // Loading was triggered by a previous call to function
  if (loaded !== null) return loaded

  // API has already loaded
  if (window.Vimeo) {
    loaded = Promise.resolve()
    return loaded
  }

  // Otherwise, load API
  loaded = new Promise((resolve) => {
    const tag = document.createElement('script')
    tag.src = 'https://player.vimeo.com/api/player.js'
    tag.onload = resolve
    document.body.appendChild(tag)
  })

  return loaded
}
