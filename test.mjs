import test from 'brittle'
import fs from 'fs'
import Localdrive from 'localdrive'

import { pack } from './index.js'

test('pack', async (t) => {
  const drive = new Localdrive('.')

  pack(drive).pipe(fs.createWriteStream('archive.tar'))
})
