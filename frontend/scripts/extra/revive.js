import { load } from '@shopify/theme-sections'

export function media({ query }) {
  const mediaQuery = window.matchMedia(query)
  return new Promise(function (resolve) {
    if (mediaQuery.matches) {
      resolve(true)
    } else {
      mediaQuery.addEventListener('change', resolve, { once: true })
    }
  })
}

export function visible({ element }) {
  return new Promise(function (resolve) {
    const observer = new window.IntersectionObserver(async function (entries) {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          observer.disconnect()
          resolve(true)
          break
        }
      }
    })
    observer.observe(element)
  })
}

export function idle() {
  return new Promise(function (resolve) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(resolve)
    } else {
      setTimeout(resolve, 200)
    }
  })
}

export default function revive(islands) {
  const knownJsExtension = '\\.((j|t)sx?|m[jt]s|vue|marko|svelte|astro)($|\\?)'
  const paths = Object.keys(islands)

  if (
    document.readyState === 'interactive' ||
    document.readyState === 'complete'
  ) {
    document
      .querySelectorAll('[data-module], [data-section-type]')
      .forEach((node) => {
        loadModule(node)
      })
  }

  async function loadModule(node) {
    let path = false

    const module = node.hasAttribute('data-module')
      ? node.getAttribute('data-module')
      : `${node.getAttribute('data-section-type')}`
    path = paths.find((path) => {
      const regex = new RegExp(`/${module}${knownJsExtension}`)

      return path.match(regex)
    })

    if (path) {
      if (node.hasAttribute('data-client-ready')) {
      } else if (node.hasAttribute('data-client-idle')) {
        await idle()
      } else if (node.hasAttribute('data-client-media')) {
        const clientMedia = node.getAttribute('data-client-media')

        if (clientMedia) {
          await media({ query: clientMedia })
        }
      } else {
        await visible({ element: node })
      }

      const { default: moduleInit } = await islands[path]()

      if (node.hasAttribute('data-section-type')) {
        load(node.getAttribute('data-section-type'), node)
      } else if (typeof moduleInit === 'function') {
        moduleInit(node)
      }
    }
  }
}
