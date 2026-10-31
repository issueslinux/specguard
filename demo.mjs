import {readFileSync} from 'node:fs';
import {analyze} from './src/core/analyze.mjs';
const path = process.argv[2] || 'examples/realistic-issue.json';
const sample = JSON.parse(readFileSync(path, 'utf8'));
console.log(JSON.stringify(analyze(sample), null, 2));
