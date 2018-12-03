import h5Adapter from '../adapters/h5'
import { isWxMiniProgram } from '../helpers/env'

let requestInstance: Function = null
// todo
const wxAdapter = () => {}

export default function dispatchRequest(config) {
  if (!requestInstance) {
    requestInstance = createDispatchRequest()
  }
  return requestInstance(config)
}

const createDispatchRequest = () => {
  return isWxMiniProgram() ? wxAdapter : h5Adapter
}