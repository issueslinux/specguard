import {readFileSync} from 'node:fs';
import {analyze, markdownReport} from './src/core/analyze.mjs';
const markdown = process.argv.includes('--markdown');
const path = process.argv.find(x => x !== '--markdown' && x !== process.argv[0] && x !== process.argv[1]) || 'examples/realistic-issue.json';
const sample = JSON.parse(readFileSync(path, 'utf8'));
const result = analyze(sample);
console.log(markdown ? markdownReport(result) : JSON.stringify(result, null, 2));
