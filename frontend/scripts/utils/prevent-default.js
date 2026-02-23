export default (fn) => (e) => {
  e.preventDefault()
  fn()
}
