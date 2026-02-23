// This loads the polyfill chunk if necessary
export default function provideResizeObserver() {
  if (window.ResizeObserver) {
    return Promise.resolve({ ResizeObserver })
  }

  return import('@/scripts/manualChunks/polyfill-resize-observer.js')
}
