# Architecture

```text
Website / CRM / messenger
          │ POST /api/leads
          ▼
   Node.js HTTP API ── validation ── JSON store
          │
          ├── GET /api/leads (pipeline + summary)
          └── PATCH /api/leads/:id/status
```

The frontend is kept dependency-free for GitHub Pages. The backend uses the Node.js standard library, atomic file replacement and pure domain functions covered by tests. `JsonLeadStore` can be replaced by a PostgreSQL adapter without changing the HTTP contract.

## API contract

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/health` | Service readiness |
| `GET` | `/api/leads` | Leads and status summary |
| `POST` | `/api/leads` | Validate and create a lead |
| `PATCH` | `/api/leads/:id/status` | Move a lead through the pipeline |
