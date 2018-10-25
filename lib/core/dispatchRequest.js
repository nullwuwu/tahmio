import wxAdapter from '../adapters/wxengine'

export default function dispatchRequest(config) {
  return new Promise((resolve, reject) => {
    try {
      wxAdapter(resolve, reject, config)
    } catch (e) {
      reject(e)
    }
  })
}
