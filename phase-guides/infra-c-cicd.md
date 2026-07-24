# Infra Phase C — CI/CD

## What this phase is

Automating the boring, error-prone deploy dance: when you push code, a pipeline
builds a fresh container image, pushes it to ECR, and updates the running app — no
manual SSH-ing into servers.

## Why it matters

Manual deploys are slow and easy to get wrong (forgot a step, deployed the wrong
branch, broke prod at 11pm). Automating them makes shipping routine and safe, and
CI/CD is a skill every professional team expects. It's also what makes frequent,
low-stress releases possible.

## Key concepts

- **CI (Continuous Integration):** automatically building and testing your code
  every time you push, so problems surface immediately instead of piling up.
- **CD (Continuous Delivery/Deployment):** automatically shipping that build to your
  environment once it passes.
- **Pipeline:** the sequence of automated steps (build → test → push image →
  deploy). Defined as a file in your repo.
- **GitHub Actions:** GitHub's built-in automation. You describe the pipeline in a
  YAML file under `.github/workflows/`, and it runs on pushes/PRs.
- **Secrets in CI:** the pipeline needs AWS credentials to deploy. These are stored
  as encrypted **GitHub secrets**, never in the workflow file. Better still, use
  short-lived credentials via OIDC so no long-term keys are stored at all.
- **Artifact:** the thing your build produces — here, the container image that gets
  pushed to ECR and then deployed.

> **Head start:** the CI half already exists. `.github/workflows/ci.yml` (added in
> the Phase 0 follow-up) runs lint → test → build → smoke on every push and PR.
> This phase is about the CD half — extend that workflow with image build, ECR
> push, and deploy steps rather than starting a new one.

## Task by task

1. **GitHub Actions: build + push on push.** On a push to main, build the image and
   push it to ECR. _Why:_ every merge produces a ready-to-run image automatically.
2. **Automated deploy step.** Update the running container(s) to the new image.
   _Why:_ closes the loop — code merged becomes code running, hands-off.
3. **Retire manual SSH deploys.** _Why:_ if deploys only happen through the pipeline,
   they're consistent, logged, and repeatable — no more "what did I run last time?"

## Common pitfalls

- **Long-lived AWS keys in GitHub:** prefer OIDC (short-lived, auto-expiring
  credentials). If you must use keys, scope them tightly and rotate them.
- **No tests in the pipeline:** at least run your critical-path tests before
  deploying, so a broken build never ships.
- **Deploying every branch:** usually only `main` deploys; feature branches just
  build/test. Be explicit about triggers.
- **No rollback plan:** keep previous images in ECR so you can redeploy the last good
  one fast if a release breaks.
- **Slow pipelines from no caching:** cache dependencies and Docker layers so the
  pipeline stays quick and you actually use it.

## How to know you're done

You push to main, and without touching a server, a pipeline builds a new image,
pushes it to ECR, and the running app updates to it — with tests gating the deploy
and a clear way to roll back.
