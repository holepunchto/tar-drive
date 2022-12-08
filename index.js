const tar = require('tar-stream')
const { pipelinePromise } = require('streamx')

exports.pack = function pack (drive, opts = {}) {
  const {
    pack = tar.pack(),
    map = defaultMap,
    ignore = defaultIgnore,
    prefix = '/'
  } = opts

  work()

  return pack

  async function work () {
    for await (const file of drive.list(prefix, { recursive: true })) {
      const {
        key: name,
        value: {
          executable,
          linkname,
          blob
        }
      } = file

      if (ignore(name)) continue

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

      const entry = pack.entry(map(header))

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
    extract = tar.extract(),
    map = defaultMap,
    ignore = defaultIgnore
  } = opts

  extract.on('entry', async (header, stream, next) => {
    header = map(header)

    const {
      type,
      name,
      linkname,
      mode
    } = header

    if (ignore(name, header)) return next()

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

function defaultMap (header) {
  return header
}

function defaultIgnore (name, header) {
  return false
}
