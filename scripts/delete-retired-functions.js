const PAGE_SIZE = 100

async function listAllFunctions(functionService) {
  const functions = []
  let offset = 0
  while (true) {
    const page = await functionService.listFunctions(PAGE_SIZE, offset)
    functions.push(...page)
    if (page.length < PAGE_SIZE) return functions
    offset += PAGE_SIZE
  }
}

async function removeRetiredFunctions(functionService, retiredNames) {
  const before = await listAllFunctions(functionService)
  const existing = new Set(before.map(item => item.FunctionName))

  for (const name of retiredNames) {
    if (!existing.has(name)) {
      console.log(`Retired function ${name} is already absent`)
      continue
    }
    await functionService.deleteFunction(name)
    console.log(`Deleted retired function ${name}`)
  }

  const after = await listAllFunctions(functionService)
  const remaining = new Set(after.map(item => item.FunctionName))
  const failed = retiredNames.filter(name => remaining.has(name))
  if (failed.length > 0) {
    throw new Error(`Retired functions still exist: ${failed.join(', ')}`)
  }
}

async function main() {
  const envId = process.env.CLOUDBASE_ENV_ID
  const secretId = process.env.TC_SECRET_ID
  const secretKey = process.env.TC_SECRET_KEY
  if (!envId || !secretId || !secretKey) {
    throw new Error('CloudBase credentials are missing')
  }

  const CloudBase = require('@cloudbase/manager-node')
  const manager = new CloudBase({ envId, secretId, secretKey })
  await removeRetiredFunctions(manager.functions, ['get-user-info', 'reorder-daily-menu'])
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}

module.exports = { listAllFunctions, removeRetiredFunctions }
