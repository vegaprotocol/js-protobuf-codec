# `protobuf-codec`

> Protocol Buffers wire encoding/decoding

## Example

### Writer

```js
import Writer from 'protobuf-codec/encoding/writer'
import { uint64, string } from 'protobuf-codec/encoding/types'

const w = new Writer()

w.varint(1, 1024n, uint64) // myInt
w.varint(2, 'Hello world', string) // myString

const buf = w.concat()
```

### Reader

```js
import Reader from 'protobuf-codec/decoding/reader'
import { uint64, string } from 'protobuf-codec/decoding/types'

const buf = new Uint8Array([ /* ... */ ])

const myInt = 0n
const myString = ''

for (const [fieldNumber, { data }] of reader(buf)) {
  switch (fieldNumber) {
    case 1:
      myInt = uint64(data); break
    case 2:
      myString = string(data); break
  }
}
```

## API

### Encoding

### `const writer = new Writer(prealloc = 256)`

### `writer.varint(fieldNumber, value, [codec])`

### `writer.bytes(fieldNumber, value, [codec])`

### `writer.fixed64(fieldNumber, value, [codec])`

### `writer.fixed32(fieldNumber, value, [codec])`

### `const buf = writer.concat([buf], [byteOffset])`

### Decoding

### `const iter = reader(buf, [byteOffset], [byteLength])`



## Install

```sh
npm install protobuf-codec
```

## License

[MIT](LICENSE)
