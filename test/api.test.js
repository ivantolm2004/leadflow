import test from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../server/app.js';

class MemoryStore {
  constructor() { this.items = []; }
  async list() { return structuredClone(this.items); }
  async save(items) { this.items = structuredClone(items); }
}

async function withApi(run) {
  const server = buildServer(new MemoryStore());
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try { await run(base); } finally { await new Promise(resolve => server.close(resolve)); }
}

test('health endpoint reports readiness', () => withApi(async base => {
  const response = await fetch(`${base}/health`);
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { status: 'ok' });
}));

test('creates, lists and moves a lead through the pipeline', () => withApi(async base => {
  const created = await fetch(`${base}/api/leads`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Anna', request: 'CRM setup', email: 'anna@example.com' }) });
  assert.equal(created.status, 201); const lead = await created.json();
  const changed = await fetch(`${base}/api/leads/${lead.id}/status`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'work' }) });
  assert.equal(changed.status, 200); assert.equal((await changed.json()).status, 'work');
  const list = await (await fetch(`${base}/api/leads`)).json();
  assert.equal(list.leads.length, 1); assert.deepEqual(list.summary, { total: 1, new: 0, work: 1, done: 0 });
}));

test('returns useful validation and not-found errors', () => withApi(async base => {
  const invalid = await fetch(`${base}/api/leads`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: '' }) });
  assert.equal(invalid.status, 422); assert.ok((await invalid.json()).errors.length >= 1);
  const missing = await fetch(`${base}/api/leads/missing/status`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'done' }) });
  assert.equal(missing.status, 404);
}));
