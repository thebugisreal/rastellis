// Fetch the product data from the .js endpoint because it includes
// more data than the .json endpoint.

export default (handle) => (cb) =>
  fetch(`${window.theme.routes.products}/${handle}.js`)
    .then((res) => res.json())
    .then((data) => cb(data))
    .catch((err) => console.log(err.message))
