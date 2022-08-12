export function tag (bigint) {
  const int = Number(bigint) // Safe as protoc only allows fieldNumber up to int32 + 3 bits for wireType
  const wireType = int & 0b111
  const fieldNumber = int >> 3

  return { wireType, fieldNumber }
}

export function uint64 (bigint) {
  return BigInt.asUintN(64, bigint)
}

export function uint32 (bigint) {
  return Number(BigInt.asUintN(32, bigint))
}

export function int64 (bigint) {
  return BigInt.asIntN(64, bigint)
}

export function int32 (bigint) {
  return Number(BigInt.asIntN(32, bigint))
}

export function sint64 (bigint) {
  return ((bigint >> 1) ^ (bigint) << 63) >> 63
}

export function sint32 (bigint) {
  return Number(((bigint >> 1) ^ (bigint) << 31) >> 31)
}

export function bool (bigint) {
  return bigint !== 0n
}

export function bytes (bytes) {
  return bytes
}

const _dec = new TextDecoder()
export function string (bytes) {
  return _dec.decode(bytes)
}

export function fixed64 (bytes) {
  return _view(bytes).getBigUint64(0, true)
}

export function sfixed64 (bytes) {
  return _view(bytes).getBigInt64(0, true)
}

export function double (bytes) {
  return _view(bytes).getFloat64(0, true)
}

export function fixed32 (bytes) {
  return _view(bytes).getUint32(0, true)
}

export function sfixed32 (bytes) {
  return _view(bytes).geInt32(0, true)
}

export function float (bytes) {
  return _view(bytes).getFloat32(0, true)
}

function _view (bytes) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
}
