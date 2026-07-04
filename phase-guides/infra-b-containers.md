# Infra Phase B — Containers

## What this phase is
Packaging your app into **containers** (with Docker) so it runs the same way
everywhere, and storing those container images in AWS's registry (ECR). You start by
running the containers on the EC2 host you already have.

## Why it matters
This is the biggest modern skill gap from your LAMP/EC2 background. "It works on my
machine" disappears when the app ships as a container that carries its own
environment. It's also the prerequisite for the orchestration (ECS/Fargate) you'll
graduate to next.

## Key concepts
- **Container:** a lightweight, isolated package containing your app *and*
  everything it needs to run (runtime, libraries, config). It runs identically on
  your laptop, EC2, or Fargate.
- **Image vs container:** an **image** is the blueprint (built once); a **container**
  is a running instance of that image. Like a class vs an object.
- **Dockerfile:** a recipe describing how to build your image (start from Node, copy
  code, install deps, run the app).
- **Container vs VM:** a virtual machine emulates a whole computer (heavy); a
  container shares the host's OS kernel and just isolates your app (light, fast to
  start). This is why containers replaced hand-configured servers for many uses.
- **ECR (Elastic Container Registry):** AWS's private storage for your images —
  like a git remote, but for container images. Your servers pull images from here.
- **Multi-service orchestration (preview):** you'll have two images (backend and
  maybe frontend). Coordinating multiple containers is what Phase D's ECS handles.

## Task by task
1. **Dockerfile for the backend** (and optionally frontend). *Why:* defines exactly
   how your app is built and run, removing "works on my machine" drift.
2. **Local `docker compose` parity.** Run your containers + Postgres locally the same
   way they'll run in the cloud. *Why:* debug container issues on your laptop, not on
   a server.
3. **ECR repositories + push images.** *Why:* your cloud hosts need somewhere trusted
   to pull images from.
4. **Run the container(s) on the EC2 host.** *Why:* a gentle first step — same server
   you know, now running containers instead of a bare Node process. Bridges toward
   ECS without a big leap.

## Common pitfalls
- **Huge images:** copying `node_modules` or build junk bloats images and slows
  deploys. Use a `.dockerignore` and multi-stage builds (build in one stage, copy
  only the result into a slim final image).
- **Baking secrets into images:** never `COPY` a `.env` with real secrets into an
  image — anyone with the image gets them. Inject config at runtime.
- **Running as root in the container:** create and use a non-root user for safety.
- **Ignoring image caching:** order Dockerfile steps so dependency installs are
  cached and only your changed code triggers a rebuild — much faster iterations.
- **Different behavior local vs cloud:** if compose mirrors production closely, you
  catch these gaps early.

## How to know you're done
Your app runs as one or more containers, the images live in ECR, and the same
containers run both locally (via compose) and on your EC2 host — behaving
identically.
