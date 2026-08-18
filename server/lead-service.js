import { randomUUID } from 'node:crypto';

export const VALID_STATUSES = new Set(['new', 'work', 'done']);

export function validateLead(input) {
  const errors = [];
  if (!input || typeof input !== 'object') return ['Request body must be an object'];
  if (!String(input.name ?? '').trim()) errors.push('name is required');
  if (!String(input.request ?? '').trim()) errors.push('request is required');
  const email = String(input.email ?? '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email is invalid');
  return errors;
}

export function createLead(input, now = new Date()) {
  const errors = validateLead(input);
  if (errors.length) return { errors };
  return {
    value: {
      id: randomUUID(),
      name: String(input.name).trim(),
      request: String(input.request).trim(),
      email: String(input.email ?? '').trim(),
      source: String(input.source ?? 'Website').trim(),
      status: 'new',
      createdAt: now.toISOString()
    }
  };
}

export function updateLeadStatus(lead, status) {
  if (!lead) return { errors: ['lead not found'] };
  if (!VALID_STATUSES.has(status)) return { errors: ['status must be new, work or done'] };
  return { value: { ...lead, status } };
}

export function summarize(leads) {
  const counts = { total: leads.length, new: 0, work: 0, done: 0 };
  for (const lead of leads) if (counts[lead.status] !== undefined) counts[lead.status] += 1;
  return counts;
}
