import { readFileSync } from 'node:fs'
const files=['index.html','src/App.tsx','src/data/projects.ts']
const content=files.map(file=>readFileSync(new URL(`../${file}`,import.meta.url),'utf8')).join('\n')
const bad=[...content.matchAll(/(?:href|repo|demo)\s*[=:]\s*['"](#["']|javascript:)/g)]
if(bad.length){console.error(`Links invalidos encontrados: ${bad.length}`);process.exit(1)}
console.log('Links locais e placeholders: OK')
