function getParamsFromUrl (url) {
  const decodedUrl = decodeURI(url)
  if (typeof decodedUrl === 'string') {
    const paramStr = (decodedUrl.split('?')[1] || '').split('#')[0]
    const pairs = paramStr.split('&').map(kvp => kvp.split('='))
    const params = pairs.reduce((acc, [key, value]) => {
      if (key) {
        acc[key] = value
      }
      return acc
    }, {})
    return params
  }
}

export default getParamsFromUrl
