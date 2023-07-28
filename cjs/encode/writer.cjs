'use strict';

var wireTypes = require('./wire-types.cjs');

const PAGE_SIZE = 256;

class Writer {
  /**
   *
   * @param {number} [prealloc=256] Number of bytes to preallocate in the internal write buffer
   */
  constructor (prealloc = PAGE_SIZE) {
    this.buf = [new Uint8Array(prealloc)];
    this.offset = 0;
  }

  /**
   * @returns {number} Number of buffers in the list of disjoint memory segments
   */
  get pages () {
    return this.buf.length
  }

  /**
   * Allocate a new memory segment to write to. Note that the whole segment must be written to
   * as internal bookkeeping will assume all requested bytes are used.
   *
   * @param {number} bytes Number of bytes to allocate and reserve for immediate consumption
   * @returns {Uint8Array}
   */
  alloc (bytes) {
    const tail = this.buf.at(-1);
    if (tail.byteLength - this.offset >= bytes) {
      this.offset += bytes;
      return tail.subarray(this.offset - bytes)
    }

    this._trim();
    this.offset = bytes;
    const buf = new Uint8Array(Math.max(bytes, PAGE_SIZE));
    this.buf.push(buf);
    return buf
  }

  /**
   * Trim the tail of the internal memory segments in case the last segment was overallocated
   * @private
   */
  _trim () {
    if (this.offset === 0) {
      this.buf.pop(); // remove the item that is unused
    } else this.buf.push(this.buf.pop().subarray(0, this.offset));
  }

  /**
   * Append filled memory segments to the internal write buffer. All segments are assumed to be
   * completely consumed.
   *
   * @param  {...Uint8Array} bufs Memory segments to append to the internal write buffer
   * @returns {Uint8Array} The last memory segment appended
   */
  append (...bufs) {
    this._trim();
    this.buf.push(...bufs);
    const tail = this.buf.at(-1);
    this.offset = tail.byteLength;

    return tail
  }

  /**
   * @template {number|BigInt} T
   * @param {number} fieldNumber
   * @param {T} value
   * @param {{ encode(value: T, buf?: Uint8Array, byteOffset: number = 0): Uint8Array, encodingLength<T>(value: T): number}} codec
   * @returns
   */
  varint (fieldNumber, value, codec = wireTypes.varint) {
    if (!value) return

    const buf = this.alloc(
      wireTypes.tag.encodingLength(fieldNumber, wireTypes.wireTypes.VARINT) +
      codec.encodingLength(value)
    );

    wireTypes.tag.encode(fieldNumber, wireTypes.wireTypes.VARINT, buf);
    codec.encode(value, buf, wireTypes.tag.encode.bytes);
  }

  bytes (fieldNumber, value, codec = wireTypes.bytes) {
    if (!value) return

    const buf = this.alloc(
      wireTypes.tag.encodingLength(fieldNumber, wireTypes.wireTypes.BYTES) +
      codec.encodingLength(value)
    );

    wireTypes.tag.encode(fieldNumber, wireTypes.wireTypes.BYTES, buf);
    codec.encode(value, buf, wireTypes.tag.encode.bytes);
  }

  fixed64 (fieldNumber, value, codec = wireTypes.uint64) {
    if (!value) return
    const buf = this.alloc(
      wireTypes.tag.encodingLength(fieldNumber, wireTypes.wireTypes.FIXED64) +
      codec.encodingLength(value)
    );

    wireTypes.tag.encode(fieldNumber, wireTypes.wireTypes.FIXED64, buf);
    codec.encode(value, buf, wireTypes.tag.encode.bytes);
  }

  fixed32 (fieldNumber, value, codec = wireTypes.uint32) {
    if (!value) return
    const buf = this.alloc(
      wireTypes.tag.encodingLength(fieldNumber, wireTypes.wireTypes.FIXED32) +
      codec.encodingLength(value)
    );

    wireTypes.tag.encode(fieldNumber, wireTypes.wireTypes.FIXED32, buf);
    codec.encode(value, buf, wireTypes.tag.encode.bytes);
  }

  encodingLength () {
    let size = 0;
    for (let i = 0; i < this.buf.length - 1; i++) {
      size += this.buf[i].byteLength;
    }

    size += this.offset;

    return size
  }

  /**
   * Concatinate the internal write buffer into a single buffer
   *
   * @param {Uint8Array} [buf] Optional buffer to write result into. Note this must have enough
   *                           space af `byteOffset` to contain the full encoding. If no buffer
   *                           is passed, one will be allocated internally
   * @param {number} byteOffset offset into `buf` that the encoding is written at
   * @returns {Uint8Array} `buf`
   */
  concat (buf, byteOffset = 0) {
    this._trim();
    const size = this.encodingLength();

    if (buf == null) buf = new Uint8Array(size);

    for (let i = 0, offset = byteOffset; i < this.buf.length; i++) {
      const b = this.buf[i];
      buf.set(b, offset);
      offset += b.byteLength;
    }

    return buf
  }
}

module.exports = Writer;
