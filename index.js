const tar = require('tar-stream')
const pump = require('pump')

exports.pack = function (drive, opts = {}) {
  const {
    pack = tar.pack()
  } = opts

  work()

  return pack

  async function work () {
    for await (const file of drive.list('/', { recursive: true })) {
      const {
        key,
        value: {
          linkname,
          blob
        }
      } = file

      const header = {
        name: key,
        type: 'file',
        size: 0
      }

      if (linkname) {
        header.type = 'symlink'
      }

      if (blob) {
        header.size = blob.byteLength
      }

      const entry = pack.entry(header)
      if (!entry) continue

      if (blob) {
        await new Promise((resolve, reject) => pump(
          drive.createReadStream(key),
          entry,
          (err) => err ? reject(err) : resolve()
        ))
      }
    }

    pack.finalize()
  }
}
