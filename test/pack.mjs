import test from 'brittle'
import fs from 'fs'
import Localdrive from 'localdrive'
import { pipeline } from 'streamx'

import { pack } from '../index.js'

test('pack', async (t) => {
  t.plan(1)

  const drive = new Localdrive('test/fixtures/pack')

  pipeline(
    pack(drive),
    fs.createWriteStream('test/fixtures/archive.tar'),
    (err) => t.absent(err)
  )
})
