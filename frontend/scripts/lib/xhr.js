function makeRequest(method, url) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest()
    xhr.open(method, url)
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response)
      } else {
        reject(new Error(this.status))
      }
    }
    xhr.onerror = function () {
      reject(new Error(this.status))
    }
    xhr.send()
  })
}

export { makeRequest }
