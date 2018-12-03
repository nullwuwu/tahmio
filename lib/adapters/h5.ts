import 'whatwg-fetch'

export default function (config: any) {
    const { url, ...options } = config

    return fetch(url, options)
}