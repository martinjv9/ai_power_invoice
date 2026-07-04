# Infra Phase D — Orchestration (ECS → Fargate)

## What this phase is
Moving from "containers running on a server I manage" to a system that runs and
supervises your containers for you: **ECS**. You start with the EC2 launch type
(familiar), then switch to **Fargate**, where AWS runs the containers and you stop
managing servers entirely.

## Why it matters
This is the graduation. It's where you stop babysitting an EC2 box (patching,
scaling, restarting crashed processes) and let AWS handle it. Understanding
orchestration is the top of the cloud-skills ladder for app deployment, and doing it
as the *last* step means every piece it needs (containers, IaC, CI/CD) already
exists.

## Key concepts
- **Orchestration:** software that runs your containers for you — starts them, keeps
  the right number alive, restarts failures, and can scale them up/down.
- **ECS (Elastic Container Service):** AWS's orchestrator. It runs your containers
  based on definitions you give it.
- **Launch types — EC2 vs Fargate:** with the **EC2 launch type**, ECS runs your
  containers on EC2 servers *you* still own (you keep the mental model you know).
  With **Fargate**, AWS provisions the compute invisibly — no servers to manage at
  all. Same containers; you just flip the setting.
- **Task definition:** the blueprint for running your container(s) in ECS — which
  image, how much CPU/memory, env vars, ports. Think of it as a Docker-run recipe
  ECS understands.
- **Service:** ECS keeps a desired number of tasks running and replaces any that die.
- **Load balancer (ALB):** distributes incoming traffic across your running
  containers and provides a stable public address, so scaling up/down is invisible
  to users.
- **CloudWatch:** AWS's logging/metrics service; your container logs and health
  metrics flow here.

## Task by task
1. **ECS cluster (EC2 launch type) via Terraform.** Run your services on ECS while
   still on EC2. *Why:* learn ECS's concepts (tasks, services) without also changing
   the compute model at the same time — one new thing at a time.
2. **Load balancer + CloudWatch logging.** Put an ALB in front; ship logs/metrics to
   CloudWatch. *Why:* a stable entry point and visibility into what your containers
   are doing.
3. **Switch launch type to Fargate.** *Why:* drop server management entirely — no
   more patching or sizing EC2 hosts. Because your containers and task definitions
   already exist, this is mostly a config change.

## Common pitfalls
- **Jumping straight to Fargate + everything at once:** change one variable at a
  time (ECS first, then Fargate) so when something breaks you know what caused it.
- **Health checks misconfigured:** if the load balancer's health check path is wrong,
  it kills healthy containers in a loop. Point it at your `/health` endpoint.
- **Task can't reach the database:** security groups/subnets must let Fargate tasks
  talk to RDS — revisit the networking from Infra Phase A.
- **Over-provisioning CPU/memory:** start small; Fargate bills for what you request.
  Scale up only if metrics show you need it.
- **Forgetting IaC discipline:** define ECS/Fargate in Terraform too, so the whole
  stack stays reproducible end to end.

## How to know you're done
Your app runs on ECS behind a load balancer with logs in CloudWatch, then on
**Fargate** with no servers for you to manage — the entire stack defined in
Terraform and deployed by your CI/CD pipeline.
