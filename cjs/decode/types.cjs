'use strict';

function tag (bigint) {
  const int = Number(bigint); // Safe as protoc only allows fieldNumber up to int32 + 3 bits for wireType
  const wireType = int & 0b111;
  const fieldNumber = int >> 3;

  return { wireType, fieldNumber }
}

function uint64 (bigint) {
  return BigInt.asUintN(64, bigint)
}

function uint32 (bigint) {
  return Number(BigInt.asUintN(32, bigint))
}

function int64 (bigint) {
  return BigInt.asIntN(64, bigint)
}

function int32 (bigint) {
  return Number(BigInt.asIntN(32, bigint))
}

function sint64 (bigint) {
  return ((bigint >> 1n) ^ (-1n * (bigint & 1n)))
}

function sint32 (bigint) {
  return Number((bigint >> 1n) ^ (-1n * (bigint & 1n)))
}

function bool (bigint) {
  return bigint !== 0n
}

function enumerable (uint) {
  return Number(uint) | 0 // trick to cast uint to int
}

function bytes (bytes) {
  return bytes
}

const _dec = new TextDecoder();
function string (bytes) {
  return _dec.decode(bytes)
}

function fixed64 (bytes) {
  return _view(bytes).getBigUint64(0, true)
}

function sfixed64 (bytes) {
  return _view(bytes).getBigInt64(0, true)
}

function double (bytes) {
  return _view(bytes).getFloat64(0, true)
}

function fixed32 (bytes) {
  return _view(bytes).getUint32(0, true)
}

function sfixed32 (bytes) {
  return _view(bytes).geInt32(0, true)
}

function float (bytes) {
  return _view(bytes).getFloat32(0, true)
}

function _view (bytes) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
}

exports.bool = bool;
exports.bytes = bytes;
exports.double = double;
exports.enumerable = enumerable;
exports.fixed32 = fixed32;
exports.fixed64 = fixed64;
exports.float = float;
exports.int32 = int32;
exports.int64 = int64;
exports.sfixed32 = sfixed32;
exports.sfixed64 = sfixed64;
exports.sint32 = sint32;
exports.sint64 = sint64;
exports.string = string;
exports.tag = tag;
exports.uint32 = uint32;
exports.uint64 = uint64;
