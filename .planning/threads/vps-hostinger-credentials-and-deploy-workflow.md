# Thread: VPS Hostinger Credentials, Git Access & Deployment Workflow

## Status: OPEN

## Goal
Maintain persistent, secure operational context across sessions for Hostinger VPS management, MySQL database administration, Git repositories, and automated backend deployment.

## Context
*Created from conversation on 2026-10-02.*

### 1. VPS Infrastructure Access
- **Host**: `200.97.166.12`
- **Port**: `22` (SSH)
- **Root User**: `root`
  - Authentication: Password verified (`#ADPJc0UoNJxo7Ll`)
  - Permissions: Full administrative control (apt packages, systemd, Nginx, firewall)
- **Application User**: `selectt-api`
  - Authentication: Password (`qdBG7QXFQayXUuwvHPzo`)
  - Remote App Directory: `/home/selectt-api/htdocs/api.selectt.in`
  - Node.js runtime: `~/.nvm/versions/node/v24.21.0/bin`
  - PM2 Service: `selectt-api`

### 2. MySQL Database
- **Host**: `200.97.166.12` (or `localhost` internal)
- **Port**: `3306`
- **Database Name**: `connect-db`
- **Username**: `selectt-wepnex`
- **Password**: `6EVSUZ7RNYA9bV0WUoxy`

### 3. Git Repositories & Remotes
- **Workspace**: `d:\selectt`
- **Current Branch**: `main`
- **Remotes**:
  - `origin`: `https://github.com/atishdeshmukh94/selectt.git`
  - `wepnex`: `https://github.com/Wepnex/selectt.git`

### 4. Deployment & Execution Automation
- Deploy backend files & restart PM2: `node d:\selectt\scripts\deploy_backend.js`
- Execute remote SQL queries or shell commands: `d:\selectt\scripts\ssh_exec.js`
- Test live database: `d:\selectt\scripts\check_live_db.js`

## References
- [`DEPLOYMENT_GUIDE.md`](file:///d:/selectt/DEPLOYMENT_GUIDE.md)
- [`scripts/deploy_backend.js`](file:///d:/selectt/scripts/deploy_backend.js)
- [`scripts/ssh_exec.js`](file:///d:/selectt/scripts/ssh_exec.js)
- [`scripts/check_live_db.js`](file:///d:/selectt/scripts/check_live_db.js)
- [`backend/index.js`](file:///d:/selectt/backend/index.js)

## Next Steps
- Awaiting task requirements from the user.
- Can create roadmap phases using `/gsd-add-phase` once the specific feature or milestone requirements are provided.
- Implement code changes, test locally, push to Git, and deploy to Hostinger VPS.
