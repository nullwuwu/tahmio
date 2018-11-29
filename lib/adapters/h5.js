export default function (config) {
  const { url, ...options } = config
  
  return fetch(url, options)
}