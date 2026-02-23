import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'

export default (node) => {
  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
