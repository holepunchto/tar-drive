import test from 'brittle'
import fs from 'fs'
import Localdrive from 'localdrive'
import { pipelinePromise } from 'streamx'

import { pack } from '../index.js'

test('pack localdrive', async (t) => {
  const drive = new Localdrive('test/fixtures/pack')

  await pipelinePromise(
    pack(drive),
    fs.createWriteStream('test/fixtures/archive.tar')
  )

  t.pass()
})
