import { decoders, tag } from './wire-types.js'
import assert from 'nanoassert'

export default function * reader (
  buf,
  byteOffset = 0,
  byteLength = buf.byteLength
) {
  let o = byteOffset
  const end = byteOffset + byteLength
  assert(end <= buf.byteLength)

  for (; o < end;) {
    const { wireType, fieldNumber } = tag(buf, o)
    const tagByteOffset = o
    const tagByteLength = tag.bytes
    o += tagByteLength

    const data = decoders[wireType](buf, o)
    const dataByteLength = decoders[wireType].bytes
    o += dataByteLength

    yield [fieldNumber, { tagByteOffset, tagByteLength, fieldNumber, wireType, dataByteLength, data }]
  }

  assert(o === end)
}
