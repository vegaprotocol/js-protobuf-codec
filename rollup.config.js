import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default [
  {
    external: [
      /node_modules/
    ],
    input: [
      'encode/types.js',
      'encode/wire-types.js',
      'encode/writer.js',
      'decode/types.js',
      'decode/wire-types.js',
      'decode/reader.js',
    ],
    output: [
      {
        dir: 'cjs',
        format: 'cjs',
        preserveModules: true,
        preserveModulesRoot: 'lib',
        entryFileNames: '[name].cjs'
      }
    ],
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  }
]
