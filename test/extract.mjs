import test from 'brittle'
import fs from 'fs'
import Localdrive from 'localdrive'
import { pipelinePromise } from 'streamx'

import { extract } from '../index.js'

test('extract localdrive', async (t) => {
  const drive = new Localdrive('test/fixtures/extract')

  await pipelinePromise(
    fs.createReadStream('test/fixtures/archive.tar'),
    extract(drive)
  )

  t.pass()
})
