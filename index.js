const tar = require('tar-stream')
const { pipelinePromise } = require('streamx')

exports.pack = function (drive, opts = {}) {
  const {
    pack = tar.pack(opts)
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

      const type = linkname ? 'symlink' : 'file'

      const header = {
        name: key,
        type,
        size: 0,
        linkname
      }

      if (type === 'file') {
        header.size = blob.byteLength
      }

      const entry = pack.entry(header)

      if (!entry) return pack.destroy(new Error(`cannot pack ${key}`))

      if (type === 'file') {
        await pipelinePromise(drive.createReadStream(key), entry)
      }

      entry.end()
    }

    pack.finalize()
  }
}

exports.extract = function (drive, opts = {}) {
  const {
    extract = tar.extract(opts)
  } = opts

  extract.on('entry', async function (header, stream, next) {
    const {
      type,
      name,
      linkname
    } = header

    if (type === 'symlink') {
      drive.symlink(name, linkname)
    }

    if (type === 'file') {
      await pipelinePromise(
        stream,
        drive.createWriteStream(name)
      )
    }

    next()
  })

  return extract
}
