import test from 'tape'

import * as decode from '../decode/types.js'
import * as decodeWire from '../decode/wire-types.js'
import * as encode from '../encode/types.js'

test('enumerable', assert => {
  ;[0, -1, 1, 2 ** 31 - 1].forEach(n => {
    assert.equal(decode.enumerable(decodeWire.varint(encode.enumerable.encode(n))), n)
  })
  assert.end()
})

test('sint32', assert => {
  // From protoscope
  const cases = [
    [[0x00], 0],
    [[0x01], -1],
    [[0x02], 1],
    [[0x04], 2],
    [[0x03], -2],
    [[0x7f], -64],
    [[0x7e], 63],
    [[0x81, 0x01], -65],
    [[0x80, 0x01], 64],
    [[0xff, 0xff, 0xff, 0xff, 0x0f], -2147483648],
    [[0xfe, 0xff, 0xff, 0xff, 0x0f], 2147483647]
  ]

  cases.forEach(([bytes, expected]) => {
    const buf = new Uint8Array(bytes)
    const varint = decodeWire.varint(buf)

    assert.equal(encode.sint32.encodingLength(expected), buf.byteLength, 'sint32 encodingLength')
    assert.deepEqual(encode.sint32.encode(expected), buf, 'sint32 encode')
    assert.equal(decode.sint32(varint), expected, 'sint32 decode')
  })

  ;[0n, -1n, 1n, encode.sint32.MAX_VALUE, encode.sint32.MIN_VALUE].forEach(n => {
    assert.looseEqual(decode.sint32(decodeWire.varint(encode.sint32.encode(n))), n, 'sint32 identity')
  })
  assert.end()
})

test('sint64', assert => {
  // From protoscope
  const cases = [
    [[0x00], 0],
    [[0x01], -1],
    [[0x02], 1],
    [[0x04], 2],
    [[0x03], -2],
    [[0x7f], -64],
    [[0x7e], 63],
    [[0x81, 0x01], -65],
    [[0x80, 0x01], 64],
    [[0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01], 9223372036854775807n],
    [[0xfd, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01], -9223372036854775807n],
    [[0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01], -9223372036854775808n]
  ]

  cases.forEach(([bytes, expected]) => {
    const buf = new Uint8Array(bytes)
    const varint = decodeWire.varint(buf)

    assert.equal(encode.sint64.encodingLength(expected), buf.byteLength, 'sint64 encodingLength')
    assert.deepEqual(encode.sint64.encode(expected), buf, 'sint64 encode')
    assert.equal(decode.sint64(varint), BigInt(expected), 'sint64 decode')
  })

  ;[0n, -1n, 1n, encode.sint64.MAX_VALUE, encode.sint64.MIN_VALUE].forEach(n => {
    assert.equal(decode.sint64(decodeWire.varint(encode.sint64.encode(n))), n, 'sint64 identity')
  })
  assert.end()
})
