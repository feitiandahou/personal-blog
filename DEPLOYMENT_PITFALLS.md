# Personal Blog Deployment Pitfalls

## Background

This document records the full deployment path, the problems encountered, the actual root causes, and the fixes that worked when deploying this project to the cloud server.

Final online result:

- Frontend static files are deployed to `/var/www/xiaobaicai`
- Host Nginx serves the frontend and handles HTTPS
- Backend runs in a container
- Host MySQL provides the database
- Domain access works
- Login works

## Final Working Architecture

The final working setup was:

1. Frontend built locally with Vite
2. Frontend build output uploaded to `/var/www/xiaobaicai`
3. Host Nginx serves the frontend and proxies `/api` and `/uploads`
4. Backend image built locally and uploaded to the server as a tar archive
5. Backend container runs on the server
6. Host MySQL is used directly by the backend

This means the deployment is **not fully containerized**. It is a hybrid deployment:

- Frontend: host filesystem + host Nginx
- Backend: container
- Database: host MySQL

## Why Deployment Became So Complicated

The main reason was not a single bug. It was a combination of several environment and architecture mismatches:

1. The server already had Nginx, HTTPS, and MySQL configured
2. Only the backend was containerized, while frontend and database stayed on the host
3. The server `docker` command was actually backed by `podman-docker`
4. The server could not reach Docker Hub reliably
5. Local Docker Desktop was not started at first
6. Container networking changed what `127.0.0.1` meant
7. MySQL `root` was not suitable as an application user

Each of these added a different layer of confusion.

## Pitfall 1: Docker Was Not Actually Simplifying This Server

### Symptom

Deployment felt much more complex than a normal host deployment.

### Root Cause

The server already had:

- Nginx
- HTTPS
- MySQL
- frontend static directory

So Docker was not managing the whole system. It only wrapped the backend.

This created three different network contexts at the same time:

1. Browser to public domain
2. Host Nginx to `127.0.0.1:8000`
3. Backend container to host MySQL

### Lesson

Docker simplifies deployment most when the entire stack is containerized, or when the host is otherwise clean. Hybrid deployment often adds complexity instead of removing it.

## Pitfall 2: Frontend and Database Did Not Need Containers

### Symptom

There was confusion about whether frontend Docker files and Docker Nginx were needed.

### Root Cause

The frontend was already correctly deployed to `/var/www/xiaobaicai`, and host Nginx was already serving it over HTTPS. Running another Nginx inside Docker would only create port conflicts on `80/443`.

Likewise, the database was already installed on the host, so a database container was unnecessary.

### Fix

The deployment was reduced to backend-only containerization.

### Lesson

Do not containerize components that are already correctly deployed and stable unless there is a clear migration plan.

## Pitfall 3: Server Did Not Have Standard Docker Engine

### Symptom

Commands showed messages like:

```text
Emulate Docker CLI using podman
```

### Root Cause

The server did not have a normal Docker Engine workflow. The `docker` command was provided by `podman-docker`, and `docker compose` was actually using an external compatibility provider.

### Impact

Normal Docker assumptions did not always hold:

- network behavior was different
- host alias behavior was different
- image registry behavior was different
- troubleshooting steps from standard Docker docs were not always directly applicable

### Lesson

Always verify whether the environment is:

- real Docker Engine
- Podman with Docker compatibility
- some managed wrapper

before making networking assumptions.

## Pitfall 4: Server Could Not Pull Base Images From Docker Hub

### Symptom

Server-side image build failed while pulling:

```text
python:3.12-slim
```

with timeout errors.

### Root Cause

The server network could not reliably access Docker Hub.

### Fix

Instead of building on the server, the backend image was built locally and exported as a tar archive:

```powershell
docker build -t personal-blog-backend:latest .
docker save -o personal-blog-backend.tar personal-blog-backend:latest
scp .\personal-blog-backend.tar root@server:/opt/
```

Then loaded on the server:

```bash
docker load -i personal-blog-backend.tar
```

### Lesson

If the server cannot reliably access image registries, build locally and upload the image instead of fighting registry/network issues on the server.

## Pitfall 5: Local Docker Desktop Was Not Running

### Symptom

Local build initially failed with Docker API errors about:

```text
npipe:////./pipe/dockerDesktopLinuxEngine
```

### Root Cause

Docker CLI was installed locally, but Docker Desktop was not actually running.

### Fix

Start Docker Desktop and confirm both `docker version` and `docker info` show a valid `Server` section before building.

### Lesson

Do not trust `docker` being installed. Always verify the daemon is running.

## Pitfall 6: Confusion Around `.env` and `.env.example`

### Symptom

There was confusion about whether to edit `.env.example` and commit it.

### Root Cause

The difference between template configuration and real runtime configuration was not explicit enough during deployment.

### Correct Rule

- `backend/.env.example` is a template and can be committed
- `backend/.env` contains real secrets and should not be committed

### Working Practice

On the server:

```bash
cp backend/.env.example backend/.env
vim backend/.env
```

Then edit the real values there.

### Lesson

Use `.env.example` only as documentation. Real deployment values must live in `.env` on the target machine.

## Pitfall 7: Container Could Not Reach Host MySQL Using Special Hostnames

### Symptom

The backend container failed to connect to MySQL using:

- `host.docker.internal`
- `host.containers.internal`

with connection errors.

### Root Cause

The host alias approach was not reliable in this server environment because the actual runtime was Podman compatibility mode and not standard Docker.

### Fix

The backend container was switched to use host networking.

In the final server compose file, backend used host networking so that `127.0.0.1` inside the backend matched the host network context.

### Lesson

When only one backend container needs to talk to host-only services, host networking can be simpler than cross-runtime host alias tricks.

## Pitfall 8: `127.0.0.1` Means Different Things in Containers

### Symptom

There was repeated confusion about what `DB_HOST=127.0.0.1` meant.

### Root Cause

In a normal bridged container network:

- `127.0.0.1` means the container itself

With host network mode:

- `127.0.0.1` means the host network

### Fix

After moving to host network mode, `DB_HOST=127.0.0.1` became correct again.

### Lesson

Always decide container networking mode first, then choose database host values second.

## Pitfall 9: Health Check Worked But Login Still Failed

### Symptom

The health endpoint returned:

```json
{"status":"ok"}
```

but login returned `500 Internal Server Error`.

### Root Cause

The health endpoint does not access the database, but login does. So backend startup success did not prove database connectivity.

### Fix

The real debugging step was to inspect backend logs during `/api/auth/login` requests.

### Lesson

Do not mistake a health endpoint for full system readiness when the endpoint does not cover database access.

## Pitfall 10: MySQL `root` User Was the Wrong Application User

### Symptom

Backend logs eventually showed:

```text
Access denied for user 'root'@'localhost'
```

### Root Cause

MySQL `root` is often restricted and is not a good application user. Even though the server could manually inspect data using root, the application was not allowed to authenticate as expected.

### Fix

A dedicated application user was created and granted access to the blog database.

Example:

```sql
CREATE USER 'blog_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON personal_blog.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;
```

Then `backend/.env` was updated to use:

```env
DB_USER=blog_user
DB_PASSWORD=YourStrongPassword123!
DB_HOST=127.0.0.1
```

### Lesson

Never use `root` as the application database account in deployment.

## Pitfall 11: Frontend Login Error Message Was Misleading

### Symptom

The frontend login page always showed a generic login failure.

### Root Cause

The frontend catches login failure and displays an “Invalid credentials” style message even when the backend is actually throwing a `500`.

### Lesson

Frontend login failure messages are not enough for deployment debugging. Always test the login API directly and inspect backend logs.

## Final Working Backend Runtime Model

The backend succeeded only after all of the following were true:

1. Local Docker Desktop was running
2. Backend image was built locally
3. Image was uploaded to the server and loaded there
4. Server compose used the loaded image instead of server-side build
5. Backend used host networking
6. `backend/.env` used `DB_HOST=127.0.0.1`
7. A dedicated MySQL application user was created
8. Nginx proxied `/api` and `/uploads` to `127.0.0.1:8000`

## Final Recommended Deployment Pattern For This Project

For the current server, the simplest practical deployment pattern is:

1. Build frontend locally
2. Upload frontend build files to `/var/www/xiaobaicai`
3. Build backend image locally
4. Upload backend image tar to the server
5. Load backend image on the server
6. Keep backend runtime config in `/opt/backend/.env`
7. Run backend container from `/opt/docker-compose.server.yml`
8. Keep host Nginx and host MySQL as they are

This is simpler than trying to fully migrate the server to an all-Docker setup right now.

## What To Do Differently Next Time

If repeating this deployment in the future, choose one of these paths up front:

### Option A: Fully host-based deployment

- frontend static files on host
- backend in Python virtualenv
- systemd for uvicorn
- host MySQL
- host Nginx

This is probably the simplest approach for a small personal project on a preconfigured server.

### Option B: Fully containerized deployment

- frontend container
- backend container
- database container
- reverse proxy container

This only becomes worthwhile if the server is clean and container-first.

### Option C: Hybrid deployment

- host frontend
- host database
- container backend

This can work, but it is the easiest to get wrong because networking assumptions become subtle.

## Core Lessons Learned

1. Docker is not automatically simpler.
2. Hybrid deployment is often harder than either full-host or full-container deployment.
3. Existing host services change whether Docker is a good fit.
4. Health checks that do not hit the database are incomplete.
5. Never use MySQL root as the application user.
6. Verify the real container runtime before relying on Docker-specific behavior.
7. If registry access is flaky, build locally and upload the image.
8. Decide the network model first, then choose `DB_HOST`.

## Final Assessment

The deployment succeeded, but Docker did not reduce complexity in this particular environment. The biggest reason was not Docker alone, but the mismatch between:

- an already configured host environment
- partial containerization
- Podman compatibility behavior
- Docker Hub connectivity problems

The project is now online and working, but the deployment path only became stable after simplifying expectations and treating Docker as a packaging tool for the backend rather than as a universal deployment simplifier.