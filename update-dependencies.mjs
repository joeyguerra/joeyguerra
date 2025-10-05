#!/usr/bin/env node

import { readFile } from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

console.log('📦 Updating all dependencies to latest versions...\n')

try {
  // Read package.json
  const packageJson = JSON.parse(await readFile('./package.json', 'utf-8'))
  
  // Get all dependency names
  const deps = Object.keys(packageJson.dependencies || {})
  const devDeps = Object.keys(packageJson.devDependencies || {})
  const allDeps = [...deps, ...devDeps]
  
  // Filter out GitHub dependencies
  const npmDeps = allDeps.filter(dep => {
    const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
    return !version.startsWith('github:')
  })
  
  if (npmDeps.length === 0) {
    console.log('❌ No npm dependencies found in package.json')
    process.exit(1)
  }
  
  console.log(`Found ${npmDeps.length} dependencies to update:`)
  console.log(npmDeps.join(', '))
  console.log('')
  
  // Uninstall all dependencies
  console.log('🗑️  Uninstalling all dependencies...')
  await execAsync(`npm uninstall ${npmDeps.join(' ')}`)
  console.log('✅ All dependencies uninstalled\n')
  
  // Reinstall with @latest
  console.log('⬇️  Installing latest versions...')
  const installList = npmDeps.map(dep => `${dep}@latest`).join(' ')
  await execAsync(`npm install ${installList}`)
  console.log('✅ All dependencies updated to latest versions!\n')
  
  // Show summary
  console.log('📋 Summary of installed versions:')
  const { stdout } = await execAsync('npm list --depth=0')
  console.log(stdout)
  
} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}
