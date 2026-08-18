import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createLead, summarize, updateLeadStatus } from './lead-service.js';
import { JsonLeadStore } from './store.js';

const here = dirname(fileURLToPath(import.meta.url));
const store = new JsonLeadStore(process.env.LEADS_FILE || join(here, '../data/leads.json'));
const port = Number(process.env.PORT || 3000);

const json = (response, status, body) => {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' });
  response.end(JSON.stringify(body));
};

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 100_000) throw new Error('payload too large');
  }
  return body ? JSON.parse(body) : {};
}

export function buildServer(leadStore = store) {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (request.method === 'OPTIONS') return json(response, 204, null);
      if (request.method === 'GET' && url.pathname === '/health') return json(response, 200, { status: 'ok' });
      if (request.method === 'GET' && url.pathname === '/api/leads') {
        const leads = await leadStore.list();
        return json(response, 200, { leads, summary: summarize(leads) });
      }
      if (request.method === 'POST' && url.pathname === '/api/leads') {
        const result = createLead(await readJson(request));
        if (result.errors) return json(response, 422, { errors: result.errors });
        const leads = await leadStore.list(); leads.unshift(result.value); await leadStore.save(leads);
        return json(response, 201, result.value);
      }
      const match = url.pathname.match(/^\/api\/leads\/([^/]+)\/status$/);
      if (request.method === 'PATCH' && match) {
        const leads = await leadStore.list(); const index = leads.findIndex(lead => lead.id === match[1]);
        const result = updateLeadStatus(leads[index], (await readJson(request)).status);
        if (result.errors) return json(response, index < 0 ? 404 : 422, { errors: result.errors });
        leads[index] = result.value; await leadStore.save(leads); return json(response, 200, result.value);
      }
      return json(response, 404, { error: 'not found' });
    } catch (error) { return json(response, error instanceof SyntaxError ? 400 : 500, { error: error.message }); }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) buildServer().listen(port, () => console.log(`LeadFlow API on http://localhost:${port}`));
