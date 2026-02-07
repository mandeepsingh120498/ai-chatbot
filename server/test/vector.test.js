import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTenantIndex, searchIndex } from '../src/utils/vector.js';

test('searchIndex returns relevant tenant document', () => {
  const docs = [
    { id: 'a', content: 'Return policy is 30 days with receipt' },
    { id: 'b', content: 'Store hours are 9am to 6pm weekdays' }
  ];

  const index = buildTenantIndex(docs);
  const results = searchIndex(index, 'what is return policy', 1);

  assert.equal(results.length, 1);
  assert.equal(results[0].id, 'a');
});
