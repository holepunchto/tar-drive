import test from 'brittle'
import fs from 'fs'
import Localdrive from 'localdrive'
import { pipeline } from 'streamx'

import { extract } from '../index.js'

test('extract', async (t) => {
  t.plan(1)

  const drive = new Localdrive('test/fixtures/extract')

  pipeline(
    fs.createReadStream('test/fixtures/archive.tar'),
    extract(drive),
    (err) => t.absent(err)
  )
})
