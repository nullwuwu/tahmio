import wxAdapter from '../adapters/wx'
import h5Adapter from '../adapters/h5'
import { isWxMiniProgram } from '../helpers/env'

let requestInstance = null

export default function dispatchRequest(config) {
  if (!requestInstance) {
    requestInstance = createDispatchRequest()
  }
  return requestInstance(config)
}

const createDispatchRequest = () => {
  return isWxMiniProgram() ? wxAdapter : h5Adapter
}