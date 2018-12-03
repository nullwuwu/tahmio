import h5Adapter from '../adapters/h5'
import wxAdapter from '../adapters/wx'
import { isWxMiniProgram } from '../helpers/env'

let requestInstance: Function = null

export default function dispatchRequest(config): Promise<any> {
  if (!requestInstance) {
    requestInstance = createDispatchRequest()
  }
  return requestInstance(config)
}

const createDispatchRequest = () => {
  return isWxMiniProgram() ? wxAdapter : h5Adapter
}