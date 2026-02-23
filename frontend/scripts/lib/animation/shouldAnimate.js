import { contains } from '@fluorescent/dom'

export default (node) => {
  return (
    contains(node, 'animation') &&
    !contains(document.documentElement, 'prefers-reduced-motion')
  )
}
