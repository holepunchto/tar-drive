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
        key: name,
        value: {
          executable,
          linkname,
          blob
        }
      } = file

      const type = linkname ? 'symlink' : 'file'

      const header = {
        name,
        type,
        mode: 0o644,
        size: 0,
        linkname
      }

      if (executable) {
        header.mode |= 0o100
      }

      if (type === 'file') {
        header.size = blob.byteLength
      }

      const entry = pack.entry(header)

      if (!entry) return pack.destroy(new Error(`cannot pack ${name}`))

      if (type === 'file') {
        await pipelinePromise(drive.createReadStream(name), entry)
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
      linkname,
      mode
    } = header

    const executable = (mode & 0o100) !== 0

    if (type === 'symlink') {
      drive.symlink(name, linkname)
    } else if (type === 'file') {
      await pipelinePromise(
        stream,
        drive.createWriteStream(name, { executable })
      )
    } else {
      extract.destroy(new Error(`cannot extract ${name}`))
    }

    next()
  })

  return extract
}
