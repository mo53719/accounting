// 批量替换 src/views 下所有 .vue 文件里的：
//   v-if="currentThemeSet === 'onepiece'" theme="onepiece"
// → v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet"
const fs = require('fs')
const path = require('path')

const VIEWS_DIR = path.join(__dirname, 'src', 'views')

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(p))
    else if (entry.name.endsWith('.vue')) out.push(p)
  }
  return out
}

const files = walk(VIEWS_DIR)
console.log(`Scanning ${files.length} vue files...`)

let updated = 0
for (const f of files) {
  const orig = fs.readFileSync(f, 'utf8')
  let content = orig
  // 1) 替换 IllustrationImage 行的 v-if 条件
  content = content.replace(
    /v-if="currentThemeSet === 'onepiece'"\s+theme="onepiece"/g,
    `v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet"`
  )
  // 2) 替换跨行的 v-if 条件
  content = content.replace(
    /v-if="currentThemeSet === 'onepiece'"\s*\n\s*theme="onepiece"/g,
    `v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet"`
  )

  if (content !== orig) {
    fs.writeFileSync(f, content, 'utf8')
    updated++
    console.log(`Updated: ${path.relative(__dirname, f)}`)
  }
}

console.log(`\nDone. ${updated} file(s) updated.`)
