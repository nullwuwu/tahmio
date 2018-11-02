import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import pkg from './package.json'

const input = 'lib/index'

export default [
  {
    input,
    output: {
      name: 'howLongUntilLunch',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  },
  {
    input,
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ]
  }
];