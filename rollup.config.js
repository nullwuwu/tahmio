import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript'
import pkg from './package.json'

const input = 'lib/tahm.ts'

export default {
  input,
  output: [
    {
      name: 'tham',
      file: pkg.browser,
      format: 'umd'
    },
    {
      file: pkg.module,
      format: 'es'
    },
    {
      file: pkg.main,
      format: 'cjs'
    }
  ],
  plugins: [
    resolve(),
    typescript()
  ]
}