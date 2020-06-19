const test = require('ava')
const model = require('../../../Editor/data/model')


test("Schema", function () {
  const schema = model.produceSchema()
  schema.pass()

})
test('S', t => {
  t.pass()
})

test('bar', async t => {
  const bar = Promise.resolve('bar')
  t.is(await bar, 'bar')
})
