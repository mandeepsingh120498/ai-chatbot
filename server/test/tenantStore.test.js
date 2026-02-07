import test from 'node:test';
import assert from 'node:assert/strict';
import { listTenants, retrieveForTenant } from '../src/services/tenantStore.js';

test('listTenants returns seeded tenant metadata', () => {
  const tenants = listTenants();
  assert.ok(tenants.length >= 2);
  assert.ok(tenants.some((t) => t.tenantId === 'alpha-bakery'));
});

test('retrieveForTenant does not leak cross-tenant data', () => {
  const bakeryResults = retrieveForTenant('alpha-bakery', 'annual members personal training');
  const fitnessResults = retrieveForTenant('beta-fitness', 'annual members personal training');

  assert.ok(Array.isArray(bakeryResults));
  assert.ok(Array.isArray(fitnessResults));
  assert.equal(bakeryResults.some((r) => /personal training|annual/i.test(r.content)), false);
  assert.equal(fitnessResults.some((r) => /personal training|annual/i.test(r.content)), true);
});
