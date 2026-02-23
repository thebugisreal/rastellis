const ls = {
  get: () => JSON.parse(localStorage.getItem('fluco_sto_recentlyViewed')),
  set: (val) =>
    localStorage.setItem('fluco_sto_recentlyViewed', JSON.stringify(val)),
}

export const updateRecentProducts = (productHandle) => {
  let recentlyViewed = []

  if (ls.get() !== null) {
    recentlyViewed = ls
      .get()
      .filter((storedHandle) => storedHandle !== productHandle)

    recentlyViewed.unshift(productHandle)
    ls.set(recentlyViewed.slice(0, 16)) // 1 extra product to account for itself
  } else if (ls.get() === null) {
    recentlyViewed.push(productHandle)
    ls.set(recentlyViewed)
  }
}

export const getRecentProducts = () => ls.get()
