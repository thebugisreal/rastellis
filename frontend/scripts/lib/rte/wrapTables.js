export default function (elements = []) {
  elements.forEach((el) => {
    const wrapper = document.createElement('div')
    wrapper.classList.add('rte__table-wrapper')
    wrapper.tabIndex = 0

    el.parentNode.insertBefore(wrapper, el)
    wrapper.appendChild(el)
  })
}
