import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel';
import pkg from './package.json'

const input = 'lib/index.js'

export default {
  input,
  output: [{
    file: pkg.module,
    format: 'es'
  }, {
    file: pkg.browser,
    format: 'umd',
    name: 'tham'
    },
    { file: pkg.main, format: 'cjs' },],
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    })
  ]
};



// export default [
//   {
//     input,
//     output: {
//       name: 'Tank',
//       file: pkg.browser,
//       format: 'umd'
//     },
//     plugins: [
//       resolve(),
//       commonjs()
//     ]
//   },
//   {
//     input,
//     output: [
//       { file: pkg.main, format: 'cjs' },
//       { file: pkg.module, format: 'es' }
//     ]
//   }
// ];