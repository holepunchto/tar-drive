# tar-drive

```sh
npm install tar-drive
```

## Usage

```js
const fs = require('fs')
const tar = require('tar-drive')

// packing a drive
tar.pack(drive).pipe(fs.createWriteStream('archive.tar'))

// extracting a drive
fs.createReadStream('archive.tar').pipe(tar.extract(drive))
```

## API

#### `const stream = pack(drive[, options])`

Options include:

```js
{
  pack: tarStream.pack(options)
}
```

#### `const stream = extract(drive[, options])`

Options include:

```js
{
  extract: tarStream.extract(options)
}
```

## License

Apache-2.0
