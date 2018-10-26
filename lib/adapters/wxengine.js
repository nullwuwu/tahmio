import assert from '../helpers/assert'

const concurrency = 10

assert(wx && wx.request, 'plz check env')

const request = require('./../core/concurrency')(wx.request, concurrency)

export default function wxAdapter(resolve, reject, config) {
  const { url, data, body, method, headers } = config

  request({
    url,
    data: data || body,
    header: headers,
    method: method.toUpperCase(),
    success: function(res) {
      if (res.statusCode !== 200) {
        reject({ ...res, ...config })
      } else {
        resolve({ ...res, ...config })
      }
    },
    fail: function(e) {
      reject({ ...e, ...config })
    }
  })
}
