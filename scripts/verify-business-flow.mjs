import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildServer } from '../server/app.js';
import { JsonLeadStore } from '../server/store.js';

const workspace = await mkdtemp(join(tmpdir(), 'leadflow-scenario-'));
const store = new JsonLeadStore(join(workspace, 'leads.json'));
let server;

async function startApi() {
  server = buildServer(store);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${server.address().port}`;
}

async function stopApi() {
  if (!server) return;
  await new Promise(resolve => server.close(resolve));
  server = undefined;
}

async function call(base, path, options = {}) {
  const response = await fetch(`${base}${path}`, options);
  return { status: response.status, body: await response.json() };
}

const jsonRequest = body => ({
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body)
});

try {
  let base = await startApi();

  const health = await call(base, '/health');
  assert.deepEqual(health, { status: 200, body: { status: 'ok' } });

  const rejected = await call(base, '/api/leads', {
    method: 'POST',
    ...jsonRequest({ name: 'Анна', request: 'Настройка CRM', email: 'wrong-address' })
  });
  assert.equal(rejected.status, 422);
  assert.deepEqual(rejected.body.errors, ['email is invalid']);

  const websiteLead = await call(base, '/api/leads', {
    method: 'POST',
    ...jsonRequest({ name: 'Анна', request: 'Настройка CRM', email: 'anna@example.com', source: 'Website' })
  });
  assert.equal(websiteLead.status, 201);

  const inWork = await call(base, `/api/leads/${websiteLead.body.id}/status`, {
    method: 'PATCH',
    ...jsonRequest({ status: 'work' })
  });
  assert.equal(inWork.status, 200);
  assert.equal(inWork.body.status, 'work');

  const telegramLead = await call(base, '/api/leads', {
    method: 'POST',
    ...jsonRequest({ name: 'Борис', request: 'Интеграция уведомлений', source: 'Telegram' })
  });
  assert.equal(telegramLead.status, 201);

  const completed = await call(base, `/api/leads/${websiteLead.body.id}/status`, {
    method: 'PATCH',
    ...jsonRequest({ status: 'done' })
  });
  assert.equal(completed.status, 200);

  await stopApi();
  base = await startApi();

  const persisted = await call(base, '/api/leads');
  assert.equal(persisted.status, 200);
  assert.deepEqual(persisted.body.summary, { total: 2, new: 1, work: 0, done: 1 });
  assert.deepEqual(
    persisted.body.leads.map(lead => ({ name: lead.name, source: lead.source, status: lead.status })),
    [
      { name: 'Борис', source: 'Telegram', status: 'new' },
      { name: 'Анна', source: 'Website', status: 'done' }
    ]
  );

  console.log(JSON.stringify({
    scenario: 'website and Telegram leads through a persisted sales pipeline',
    checks: {
      health: '200 ok',
      invalidEmail: '422 rejected',
      statusFlow: 'new -> work -> done',
      persistence: 'verified after server restart'
    },
    finalSummary: persisted.body.summary,
    leads: persisted.body.leads.map(lead => ({ source: lead.source, status: lead.status }))
  }, null, 2));
} finally {
  await stopApi();
  await rm(workspace, { recursive: true, force: true });
}

