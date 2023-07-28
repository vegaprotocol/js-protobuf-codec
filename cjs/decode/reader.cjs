'use strict';

var wireTypes = require('./wire-types.cjs');
var assert = require('nanoassert');

function * reader (
  buf,
  byteOffset = 0,
  byteLength = buf.byteLength
) {
  let o = byteOffset;
  const end = byteOffset + byteLength;
  assert(end <= buf.byteLength);

  for (; o < end;) {
    const { wireType, fieldNumber } = wireTypes.tag(buf, o);
    const tagByteOffset = o;
    const tagByteLength = wireTypes.tag.bytes;
    o += tagByteLength;

    const data = wireTypes.decoders[wireType](buf, o);
    const dataByteLength = wireTypes.decoders[wireType].bytes;
    o += dataByteLength;

    yield [fieldNumber, { tagByteOffset, tagByteLength, fieldNumber, wireType, dataByteLength, data }];
  }

  assert(o === end);
}

module.exports = reader;
