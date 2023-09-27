const assert = require('nanoassert')

const wireTypes = {
  VARINT: 0,
  BYTES: 2,
  FIXED64: 1,
  FIXED32: 5
}

const varint = {
  encode(
    int,
    buf = alloc(this, int),
    byteOffset = 0
  ) {
    assert(int >= this.MIN_VALUE, 'int exceeds MIN_VALUE')
    assert(int <= this.MAX_VALUE, 'int exceeds MAX_VALUE')
    let o = byteOffset
    let n = BigInt(int)

    while (n >= 128n) {
      buf[o++] = Number((n & 0xffn) | 0b1000_0000n)
      n >>= 7n
    }

    buf[o++] = Number(n)

    this.encode.bytes = o - byteOffset
    return buf.subarray(byteOffset, o)
  },
  encodeOversize(int, len, buf, byteOffset = 0) {
    assert(int >= this.MIN_VALUE, 'int exceeds MIN_VALUE')
    assert(int <= this.MAX_VALUE, 'int exceeds MAX_VALUE')
    assert(len >= this.encodingLength(int), 'len does not fit int')
    assert(buf.byteLength - byteOffset >= len, 'buf does not fit len')
    let o = byteOffset
    const end = byteOffset + len - 1

    let n = BigInt(int)

    while (o < end) {
      buf[o++] = Number((n & 0xffn) | 0b1000_0000n)
      n >>= 7n
    }

    buf[o++] = Number(n)

    this.encodeOversize.bytes = o - byteOffset
    return buf.subarray(byteOffset, o)
  },
  encodingLength(int) {
    assert(int >= this.MIN_VALUE, 'int exceeds MIN_VALUE')
    assert(int <= this.MAX_VALUE, 'int exceeds MAX_VALUE')
    if (int <= 0xffff_ffff) return (9 * (32 - Math.clz32(Number(int))) + 64) / 64 | 0
    const high = Number(BigInt(int) >> 32n)
    return (9 * (32 - Math.clz32(high) + 32) + 64) / 64 | 0
  },
  MIN_VALUE: 0n,
  MAX_VALUE: (1n << 64n) - 1n
}

const bytes = {
  encode(src, buf = alloc(this, src), byteOffset = 0) {
    let o = byteOffset
    varint.encode(src.byteLength, buf, o)
    o += varint.encode.bytes
    buf.set(src, o)
    o += src.byteLength
    this.encode.bytes = o - byteOffset
    return buf.subarray(byteOffset, o)
  },
  encodingLength(src) {
    return varint.encodingLength(src.byteLength) + src.byteLength
  }
}

const tag = {
  encode(
    fieldNumber,
    wireType,
    buf = alloc(this, fieldNumber),
    byteOffset = 0
  ) {
    assert(fieldNumber > 0, 'fieldNumber must be greater than 0')
    assert(fieldNumber <= tag.MAX_VALUE, 'fieldNumber exceeds MAX_VALUE')
    const int = BigInt.asUintN(32, BigInt(fieldNumber)) << 3n | BigInt(wireType)
    varint.encode(int, buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength(fieldNumber) {
    assert(fieldNumber > 0, 'fieldNumber must be greater than 0')
    assert(fieldNumber <= tag.MAX_VALUE, 'fieldNumber exceeds MAX_VALUE')

    return (9 * (32 - Math.clz32(Number(fieldNumber) << 3)) + 64) / 64 | 0
  },
  MIN_VALUE: 1n,
  MAX_VALUE: (1n << 29n) - 1n
}

const string = {
  encode(str, buf = alloc(this, str), byteOffset = 0) {
    assert(typeof str === 'string')
    const src = utf8.decode(str)
    bytes.encode(src, buf, byteOffset)
    this.encode.bytes = bytes.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength(str) {
    const len = [...str].length

    return varint.encodingLength(len) + len
  }
}

const uint64 = {
  encode(uint, buf = alloc(this, uint), byteOffset = 0) {
    assert(uint >= this.MIN_VALUE, 'uint exceeds MIN_VALUE')
    assert(uint <= this.MAX_VALUE, 'uint exceeds MAX_VALUE')
    const biguint = BigInt(uint)
    varint.encode(BigInt.asUintN(64, biguint), buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength(uint) {
    assert(uint >= this.MIN_VALUE, 'uint exceeds MIN_VALUE')
    assert(uint <= this.MAX_VALUE, 'uint exceeds MAX_VALUE')
    return varint.encodingLength(uint)
  },
  MIN_VALUE: varint.MIN_VALUE,
  MAX_VALUE: varint.MAX_VALUE
}

const int64 = {
  encode(int, buf = alloc(this, int), byteOffset = 0) {
    assert(int >= this.MIN_VALUE, 'int exceeds MIN_VALUE')
    assert(int <= this.MAX_VALUE, 'int exceeds MAX_VALUE')
    const bigint = BigInt(int)
    varint.encode(BigInt.asUintN(64, bigint), buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength(int) {
    assert(int >= this.MIN_VALUE, 'int exceeds MIN_VALUE')
    assert(int <= this.MAX_VALUE, 'int exceeds MAX_VALUE')
    return varint.encodingLength(BigInt.asUintN(64, BigInt(int)))
  },
  MIN_VALUE: -(1n << 63n),
  MAX_VALUE: (1n << 63n) - 1n
}

const sint64 = {
  encode(int, buf = alloc(this, int), byteOffset = 0) {
    assert(int >= this.MIN_VALUE, 'int exceeds MIN_VALUE')
    assert(int <= this.MAX_VALUE, 'int exceeds MAX_VALUE')
    const bigint = BigInt(int)
    varint.encode(BigInt.asUintN(64, (bigint << 1n) ^ (bigint >> 63n)), buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength(int) {
    assert(int >= this.MIN_VALUE, 'int exceeds MIN_VALUE')
    assert(int <= this.MAX_VALUE, 'int exceeds MAX_VALUE')
    const bigint = BigInt(int)
    return varint.encodingLength((bigint << 1n) ^ (bigint >> 63n))
  },
  MIN_VALUE: -(1n << 63n),
  MAX_VALUE: (1n << 63n) - 1n
}

const uint32 = {
  encode(uint, buf = alloc(this, uint), byteOffset = 0) {
    assert(uint >= this.MIN_VALUE, 'uint exceeds MIN_VALUE')
    assert(uint <= this.MAX_VALUE, 'uint exceeds MAX_VALUE')
    const bigint = BigInt(uint)
    varint.encode(BigInt.asUintN(32, bigint), buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength(uint) {
    assert(uint >= this.MIN_VALUE, 'uint exceeds MIN_VALUE')
    assert(uint <= this.MAX_VALUE, 'uint exceeds MAX_VALUE')
    return varint.encodingLength(uint)
  },
  MIN_VALUE: 0,
  MAX_VALUE: (1n << 32n) - 1n
}

const int32 = {
  encode(int, buf = alloc(this, int), byteOffset = 0) {
    assert(int >= this.MIN_VALUE, 'int exceeds MIN_VALUE')
    assert(int <= this.MAX_VALUE, 'int exceeds MAX_VALUE')
    const bigint = BigInt(int)
    varint.encode(BigInt.asUintN(32, bigint), buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength(int) {
    assert(int >= this.MIN_VALUE, 'int exceeds MIN_VALUE')
    assert(int <= this.MAX_VALUE, 'int exceeds MAX_VALUE')
    return varint.encodingLength(BigInt.asUintN(32, BigInt(int)))
  },
  MIN_VALUE: -(1n << 31n),
  MAX_VALUE: (1n << 31n) - 1n
}

const sint32 = {
  encode(int, buf = alloc(this, int), byteOffset = 0) {
    assert(int >= this.MIN_VALUE, 'int exceeds MIN_VALUE')
    assert(int <= this.MAX_VALUE, 'int exceeds MAX_VALUE')
    const bigint = BigInt(int)
    varint.encode((bigint << 1n) ^ (bigint >> 31n), buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength(int) {
    assert(int >= this.MIN_VALUE, 'int exceeds MIN_VALUE')
    assert(int <= this.MAX_VALUE, 'int exceeds MAX_VALUE')
    const bigint = BigInt(int)
    return varint.encodingLength((bigint << 1n) ^ (bigint >> 31n))
  },
  MIN_VALUE: -(1n << 31n),
  MAX_VALUE: (1n << 31n) - 1n
}

const bool = {
  encode(val, buf = alloc(this), byteOffset = 0) {
    varint.encode(val === true ? 1 : 0, buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength() {
    return 1
  }
}

const double = {
  encode(val, buf = alloc(this), byteOffset = 0) {
    _view(buf).setFloat64(0, val, true)
    this.encode.bytes = 8
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength() {
    return 8
  }
}

const float = {
  encode(val, buf = alloc(this), byteOffset = 0) {
    _view(buf).setFloat32(0, val, true)
    this.encode.bytes = 4
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength() {
    return 4
  }
}

function _view(bytes) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
}

const enumerable = {
  encode(en, buf = alloc(this, en), byteOffset = 0) {
    assert(en >= enumerable.MIN_VALUE, 'enum value exceeds MIN_VALUE')
    assert(en <= enumerable.MAX_VALUE, 'enum value exceeds MAX_VALUE')

    en = Number(en) >>> 0 // cast to uint32 for varint encoding
    varint.encode(en, buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength(en) {
    assert(en >= enumerable.MIN_VALUE, 'enum value exceeds MIN_VALUE')
    assert(en <= enumerable.MAX_VALUE, 'enum value exceeds MAX_VALUE')
    return varint.encodingLength(Number(en) >>> 0)
  },
  MIN_VALUE: -(1n << 31n),
  MAX_VALUE: (1n << 31n) - 1n
}

const enc = new TextEncoder()
const dec = new TextDecoder()

function alloc(ctx, ...data) {
  return new Uint8Array(ctx.encodingLength(...data))
}

const utf8 = {
  encode(buf) { return dec.decode(buf) },
  decode(str) { return enc.encode(str) }
}

module.exports = {
  wireTypes,
  varint,
  bytes,
  tag,
  string,
  int64,
  uint64,
  sint64,
  int32,
  uint32,
  sint32,
  bool,
  double,
  float,
  enumerable,
  utf8,
  alloc
}
