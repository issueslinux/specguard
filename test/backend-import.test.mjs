import test from 'node:test';
import assert from 'node:assert/strict';
import {handler} from '../src/backend/index.js';

test('Forge resolver can initialize with installed CJS/ESM package exports', () => {
  assert.equal(typeof handler, 'function');
});
