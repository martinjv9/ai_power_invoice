# Infra Phase A — AWS: EC2, RDS, Networking, IaC

## What this phase is
Taking the app you built locally and running it on AWS: a server (EC2), a managed
database (RDS Postgres), proper networking (VPC), and — crucially — defining all of
it as code with Terraform instead of clicking around the AWS console.

## Why it matters
This is where cloud learning gets real. You already know EC2 from your LAMP days;
here you level it up with a *managed* database, *proper* networking and permissions,
and *infrastructure-as-code* — the three things that separate "I ran a server once"
from "I can build cloud infrastructure."

## Key concepts
- **EC2 (Elastic Compute Cloud):** a virtual server you rent from AWS. You already
  know this one.
- **RDS (Relational Database Service):** a managed Postgres database. AWS handles
  backups, patching, and failover — the stuff you did by hand with MySQL on LAMP.
  You give up some control in exchange for not babysitting it.
- **VPC (Virtual Private Cloud):** your own private network inside AWS. Contains
  **subnets** (network segments — public ones face the internet, private ones don't).
- **Security group:** a virtual firewall controlling what traffic reaches a resource
  (e.g. "allow web traffic on 443, allow the app to reach the DB on 5432, block
  everything else").
- **IAM (Identity and Access Management):** who/what can do what in AWS. **Roles**
  and **policies** grant least-privilege access (e.g. the EC2 instance may read one
  secret, nothing more).
- **Infrastructure as Code (IaC) / Terraform:** describing your whole AWS setup in
  text files you version in git. Run Terraform and it creates/updates everything to
  match. You can destroy and recreate it identically — no more forgotten manual
  clicks.
- **State (Terraform):** Terraform's record of what it has created. Store it safely
  (e.g. in S3) so it isn't lost or conflicting.

## Task by task
1. **Account hygiene.** Create a non-root IAM user, turn on MFA, and set a
   **Budgets alarm**. *Why:* the root account is dangerous to use daily, and the
   budget alarm is your insurance against a surprise bill — do this *first*.
2. **Terraform skeleton.** Providers + remote state backend (S3). *Why:* a safe,
   shareable home for your infra definitions before you build anything.
3. **VPC, subnets, security groups, IAM roles in Terraform.** *Why:* the private
   network and firewall rules everything else sits inside; defining them in code
   makes the whole stack reproducible.
4. **RDS Postgres via Terraform.** In a private subnet, reachable only by the app.
   *Why:* your database should never be exposed to the public internet.
5. **EC2 via Terraform + deploy the app.** Run the backend as a Node process; serve
   the built frontend (from the backend or S3/CloudFront). *Why:* your app, now in
   the cloud, provisioned reproducibly.
6. **Point the app at RDS via env/secrets.** *Why:* the app shouldn't change between
   laptop and cloud — only its config (the database URL) does.

## Common pitfalls
- **Using the root account for everything:** create an IAM user; keep root locked
  away with MFA.
- **No budget alarm:** the classic beginner $200 surprise. Set it on day one.
- **Public database:** never put RDS in a public subnet. App reaches it privately.
- **Clicking in the console then wondering why Terraform "forgets":** once you go
  IaC, make *all* changes through Terraform, or its state drifts from reality.
- **Committing secrets or state:** Terraform state can contain secrets — store it in
  S3, not git.

## How to know you're done
Your app is reachable on AWS, backed by an RDS Postgres in a private subnet, with
networking and permissions locked down — and you can tear it all down and recreate
it from your Terraform code alone.
