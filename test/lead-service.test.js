import test from 'node:test';
import assert from 'node:assert/strict';
import { createLead, summarize, updateLeadStatus, validateLead } from '../server/lead-service.js';

test('validates required fields and email', () => {
  assert.deepEqual(validateLead({ name: '', request: '' }), ['name is required', 'request is required']);
  assert.deepEqual(validateLead({ name: 'Anna', request: 'CRM', email: 'bad' }), ['email is invalid']);
});

test('normalizes a new lead', () => {
  const result = createLead({ name: ' Anna ', request: ' CRM ', source: 'Ads' }, new Date('2026-01-02T10:00:00Z'));
  assert.equal(result.value.name, 'Anna'); assert.equal(result.value.status, 'new');
  assert.equal(result.value.createdAt, '2026-01-02T10:00:00.000Z'); assert.ok(result.value.id);
});

test('updates only to supported statuses', () => {
  assert.equal(updateLeadStatus({ id: '1', status: 'new' }, 'done').value.status, 'done');
  assert.deepEqual(updateLeadStatus({ id: '1' }, 'deleted').errors, ['status must be new, work or done']);
});

test('summarizes pipeline statuses', () => {
  assert.deepEqual(summarize([{ status: 'new' }, { status: 'work' }, { status: 'new' }]), { total: 3, new: 2, work: 1, done: 0 });
});
