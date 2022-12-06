import test from 'brittle'
import b4a from 'b4a'
import { pipelinePromise } from 'streamx'

import Corestore from 'corestore'
import Hyperdrive from 'hyperdrive'
import RAM from 'random-access-memory'

import { pack, extract } from '../index.js'

test('pack and extract hyperdrive', async (t) => {
  t.plan(1)

  const a = await createHyperdrive(t)
  const b = await createHyperdrive(t)

  await a.put('foo.txt', 'hello world')

  await pipelinePromise(
    pack(a),
    extract(b)
  )

  t.alike(await b.get('foo.txt'), b4a.from('hello world'))
})

async function createStore (t) {
  const store = new Corestore(RAM)

  t.teardown(() => store.close())

  await store.ready()
  return store
}

async function createHyperdrive (t, store = createStore(t)) {
  const drive = new Hyperdrive(await store)

  t.teardown(() => drive.close())

  await drive.ready()
  return drive
}
