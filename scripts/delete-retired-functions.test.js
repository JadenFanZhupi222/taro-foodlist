const assert = require('node:assert/strict')
const test = require('node:test')

const { removeRetiredFunctions } = require('./delete-retired-functions')

test('deletes retired functions that still exist', async () => {
  let names = ['active-function', 'get-user-info', 'reorder-daily-menu']
  const deleted = []
  const service = {
    async listFunctions() {
      return names.map(FunctionName => ({ FunctionName }))
    },
    async deleteFunction(name) {
      deleted.push(name)
      names = names.filter(item => item !== name)
    }
  }

  await removeRetiredFunctions(service, ['get-user-info', 'reorder-daily-menu'])

  assert.deepEqual(deleted, ['get-user-info', 'reorder-daily-menu'])
})

test('treats already absent retired functions as success', async () => {
  const service = {
    async listFunctions() { return [{ FunctionName: 'active-function' }] },
    async deleteFunction() { assert.fail('deleteFunction must not be called') }
  }

  await removeRetiredFunctions(service, ['get-user-info', 'reorder-daily-menu'])
})

test('fails when a retired function still exists after deletion', async () => {
  const service = {
    async listFunctions() { return [{ FunctionName: 'get-user-info' }] },
    async deleteFunction() {}
  }

  await assert.rejects(
    removeRetiredFunctions(service, ['get-user-info']),
    /still exist: get-user-info/
  )
})
