

export const tag = {
  encode (
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
  encodingLength (fieldNumber) {
    assert(fieldNumber > 0, 'fieldNumber must be greater than 0')
    assert(fieldNumber <= tag.MAX_VALUE, 'fieldNumber exceeds MAX_VALUE')

    return (9 * (32 - Math.clz32(Number(fieldNumber) << 3)) + 64) / 64 | 0
  },
  MAX_VALUE: (1n << 29n) - 1n
}

export const string = {
  encode(str, buf = alloc(this, str), byteOffset = 0) {
    assert(typeof str === 'string')
    const src = utf8.decode(str)
    bytes.encode(src, buf, byteOffset)
    this.encode.bytes = bytes.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength (str) {
    const len = [...str].length

    return varint.encodingLength(len) + len
  }
}

export const uint64 = {
  encode (int, buf = alloc(this, int), byteOffset = 0) {
    const bigint = BigInt(int)
    varint.encode(BigInt.asUintN(64, bigint), buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength (int) {
    return varint.encodingLength(int)
  }
}

export const int64 = {
  encode (int, buf = alloc(this, int), byteOffset = 0) {
    const bigint = BigInt(int)
    varint.encode(BigInt.asIntN(64, bigint), buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength (int) {
    return varint.encodingLength(int)
  }
}

export const sint64 = {
  encode (int, buf = alloc(this, int), byteOffset = 0) {
    const bigint = BigInt(int)
    varint.encode(BigInt.asIntN(64, (bigint << 1n) ^ (bigint >> 63)), buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength (int) {
    return varint.encodingLength(int)
  }
}

export const uint32 = {
  encode (int, buf = alloc(this, int), byteOffset = 0) {
    const bigint = BigInt(int)
    varint.encode(BigInt.asUintN(32, bigint), buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength (int) {
    return varint.encodingLength(int)
  }
}

export const int32 = {
  encode (int, buf = alloc(this, int), byteOffset = 0) {
    const bigint = BigInt(int)
    varint.encode(BigInt.asIntN(32, bigint), buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength (int) {
    return varint.encodingLength(int)
  }
}

export const sint32 = {
  encode (int, buf = alloc(this, int), byteOffset = 0) {
    const bigint = BigInt(int)
    varint.encode(BigInt.asIntN(32, (bigint << 1n) ^ (bigint >> 31)), buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength (int) {
    return varint.encodingLength(int)
  }
}

export const bool = {
  encode (val, buf = alloc(this), byteOffset = 0) {
    varint.encode(val === true ? 1 : 0, buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength () {
    return 1
  }
}

export const double = {
  encode (val, buf = alloc(this), byteOffset = 0) {
    _view(buf).setFloat64(val)
    this.encode.bytes = 8
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength () {
    return 8
  }
}

export const float = {
  encode (val, buf = alloc(this), byteOffset = 0) {
    _view(buf).setFloat32(val)
    this.encode.bytes = 4
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength () {
    return 4
  }
}

function _view (bytes) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
}

export const enumerable = {
  encode(en, buf = alloc(this, en), byteOffset = 0) {
    assert(en <= enumerable.MAX_VALUE, 'enum value exceeds MAX_VALUE')
    varint.encode(en, buf, byteOffset)
    this.encode.bytes = varint.encode.bytes
    return buf.subarray(byteOffset, byteOffset + this.encode.bytes)
  },
  encodingLength (en) {
    return varint.encodingLength(en)
  },
  MAX_VALUE: (1n << 32n) - 1n
}

const enc = new TextEncoder()
const dec = new TextDecoder()

export function alloc (ctx, ...data) {
  return new Uint8Array(ctx.encodingLength(...data))
}

export const utf8 = {
  encode (buf) { return dec.decode(buf) },
  decode (str) { return enc.encode(str) }
}
