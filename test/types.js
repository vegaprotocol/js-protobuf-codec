const test = require('tape')

const decode = require('../decode/types.js')
const decodeWire = require('../decode/wire-types.js')
const encode = require('../encode/types.js')

test('enumerable', assert => {
  ;[0, -1, 1, 2 ** 31 - 1, encode.enumerable.MIN_VALUE, encode.enumerable.MAX_VALUE].forEach(n => {
    assert.looseEqual(decode.enumerable(decodeWire.varint(encode.enumerable.encode(n))), n)
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

test('int64 indentity', assert => {
  const cases = [
    encode.int64.MIN_VALUE,
    encode.int64.MAX_VALUE,
    0n,
    1n,
    -1n,
    2n,
    -2n,
    63n,
    -64n,
    64n,
    -65n,
    2n ** 31n - 1n,
    -(2n ** 31n),
    2n ** 31n,
    -(2n ** 31n - 1n),
    // Two Number values
    0,
    1
  ]

  cases.forEach(n => {
    assert.equal(decode.int64(decodeWire.varint(encode.int64.encode(n))), BigInt(n))
  })

  assert.end()
})

test('double identity', assert => {
  const cases = [
    0,
    Number.MIN_VALUE,
    Number.MAX_VALUE,
    Number.MIN_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.EPSILON,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.NaN,
    1,
    1 / 3
  ]

  cases.forEach(n => {
    assert.equal(decode.double(decodeWire.fixed64bit(encode.double.encode(n))), n)
  })

  assert.end()
})

test('double identity', assert => {
  const cases = [
    0,
    Number.MIN_VALUE,
    Number.MAX_VALUE,
    Number.MIN_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.EPSILON,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.NaN,
    1,
    1 / 3
  ].map(n => Math.fround(n))

  cases.forEach(n => {
    assert.equal(decode.float(decodeWire.fixed32bit(encode.float.encode(n))), n)
  })

  assert.end()
})
