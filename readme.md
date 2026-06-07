# ⎈ Launchkube — Deploy any GitHub repo to Kubernetes

A self-hosted deployment platform that takes a GitHub repo URL and deploys it as a live application on a Kubernetes cluster — fully automated, end to end. Built as a hands-on alternative to understanding what platforms like Vercel and Railway do under the hood.

**Live Demo** → [launchkube.rsxdev.co.in](https://launchkube.rsxdev.co.in) | **YouTube Playlist** → [Watch the full 5-part build series](https://www.youtube.com/playlist?list=PLMkYlV75HbGfPJZ06xw7HHbFHpcV8zj1P)

---

## Demo

### Live log streaming

https://github.com/Raghvendra9402/Launchkube/blob/main/docs/live-logs.mp4

> Real-time build and deploy logs streamed from the EC2 worker to the browser via SSE

---

## Screenshots

### Kubernetes Resource Isolation

Every deployment receives its own dedicated Kubernetes namespace. Launchkube automatically provisions and manages the Deployment, ReplicaSet, Pod, Service, and Ingress resources for each application, providing workload isolation and simplified operations.

![Kubernetes Resource Isolation](./docs/k8s-resources.png)

---

### Environment Variables as Kubernetes Secrets

Environment variables provided during deployment are securely stored as Kubernetes Secrets and mounted into the container at runtime. Sensitive values remain separate from the Docker image and application source code.

![Kubernetes Secrets](./docs/k8s-secrets.png)

---

### Automatic Public URL Generation

After a successful deployment, Launchkube automatically provisions ingress rules and exposes the application on the internet using a unique subdomain. Users receive a live URL that can be accessed immediately without any manual Kubernetes or networking configuration.

**Example:**
`https://app-<deployment-id>.rsxdev.co.in`

![Live Application URL](./docs/live-url.png)

---

## Architecture

```
User submits GitHub repo URL
            ↓
    Next.js Backend API
            ↓
       AWS SQS Queue
            ↓
    EC2 Worker polls job
     ↙       ↓        ↘
git clone  docker    push to
           build      ECR
            ↓
  helm upgrade --install
  (per-user namespace)
            ↓
    Kubernetes Cluster
            ↓
  App live on custom domain
  via Kubernetes Ingress
```

---

## How it works

1. User submits a GitHub repo URL from the frontend
2. Backend validates the URL and drops a job message into **AWS SQS**
3. **EC2 worker** polls the SQS queue and picks up the job
4. Worker clones the repo, runs `docker build`, pushes the image to **AWS ECR** with a unique tag
5. Worker runs `helm upgrade --install` — each deployment gets its own **Kubernetes namespace**
6. App is exposed via **Kubernetes Ingress** on a custom domain
7. Build logs stream back to the browser in real time via **SSE**
8. Job status is written to the database — frontend shows `building → deployed → live`

---

## Tech Stack

| Layer              | Tech                                |
| ------------------ | ----------------------------------- |
| Frontend + API     | Next.js, Tailwind, shadcn/ui        |
| Auth               | BetterAuth + JWT                    |
| Queue              | AWS SQS                             |
| Worker             | EC2 (Node.js)                       |
| Container Registry | AWS ECR                             |
| Deployment         | Kubernetes + Helm                   |
| Log Streaming      | SSE (Server Sent Events)            |
| Database           | PostgreSQL + Prisma                 |
| Ingress            | Kubernetes Ingress + custom domain  |
| AWS Auth           | IAM Roles — zero static credentials |

---

## Repo Structure

```
Launchkube/
  fe/                        # Next.js frontend + API routes
    app/
    components/
    hooks/
    .env.example

  worker/                    # EC2 worker — SQS polling + build + deploy
    scripts/
      clone.sh               # git clone the repo
      build-push.sh          # docker build + push to ECR
      deploy.sh              # helm upgrade --install to K8s
    worker.js                # main SQS polling loop
    ecosystem.config.js      # PM2 config
    .env.example

  helm-chart/                # Helm chart used for every deployment
    Chart.yaml
    values.yaml
    templates/
      deployment.yaml
      service.yaml
      ingress.yaml

  docs/
    live-logs.mp4            # demo — live log streaming
```

---

## Prerequisites

- AWS account
- Kubernetes cluster (EKS or k3s on EC2)
- `kubectl` configured pointing to your cluster
- Helm installed on the worker EC2
- Docker installed on the worker EC2
- Node.js 20+

---

## Setup Guide

### 1. Clone the repo

```bash
git clone https://github.com/Raghvendra9402/Launchkube
cd Launchkube
```

---

### 2. AWS Setup

#### Create SQS Queue

```
AWS Console → SQS → Create Queue
Type   → Standard
Name   → launchkube-jobs
```

Copy the Queue URL — needed in both frontend and worker `.env`.

#### Create ECR Repository

```
AWS Console → ECR → Create Repository
Name → launchkube
```

Copy the ECR URI — `YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/launchkube`

---

#### IAM Role for EC2 Worker

Create an IAM Role with EC2 as trusted entity. Attach this inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:YOUR_REGION:YOUR_ACCOUNT_ID:launchkube-jobs"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    }
  ]
}
```

Attach this role to your EC2 worker instance — no access keys needed on the machine.

---

#### IAM User for Frontend (SendMessage only)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["sqs:SendMessage"],
      "Resource": "arn:aws:sqs:YOUR_REGION:YOUR_ACCOUNT_ID:launchkube-jobs"
    }
  ]
}
```

Generate Access Key + Secret for this user → goes in frontend `.env`.

---

### 3. EC2 Worker Setup

Launch an EC2 instance (Ubuntu 22.04, t3.small recommended). Attach the IAM role above.

```bash
# install dependencies
sudo apt update
sudo apt install -y docker.io nodejs npm git

# install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# install helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# configure kubeconfig for EKS
aws eks update-kubeconfig --region ap-south-1 --name YOUR_CLUSTER_NAME

# clone and setup worker
git clone https://github.com/Raghvendra9402/Launchkube
cd Launchkube/worker
cp .env.example .env
nano .env

# install and start
npm install
npm start
```

---

### 4. Environment Variables

**worker/.env.example**

```bash
AWS_REGION=ap-south-1
AWS_ACCOUNT_ID=YOUR_AWS_ACCOUNT_ID
ECR_REPO_NAME=launchkube
SQS_QUEUE_URL=https://sqs.ap-south-1.amazonaws.com/YOUR_ACCOUNT_ID/launchkube-jobs
KUBECONFIG=/home/ubuntu/.kube/config
HELM_CHART_PATH=/home/ubuntu/Launchkube/helm-chart
K8S_DOMAIN=yourdomain.com
DATABASE_URL=postgresql://user:password@host:5432/launchkube
```

**fe/.env.example**

```bash
# IAM user with sqs:SendMessage only
AWS_ACCESS_KEY_ID=YOUR_IAM_USER_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_IAM_USER_SECRET_KEY
AWS_REGION=ap-south-1
SQS_QUEUE_URL=https://sqs.ap-south-1.amazonaws.com/YOUR_ACCOUNT_ID/launchkube-jobs

DATABASE_URL=postgresql://user:password@host:5432/launchkube

BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

---

### 5. Run the frontend

```bash
cd fe
npm install
npm run dev
```

---

## How the worker processes each job

```
1.  Poll SQS queue (long polling)
2.  Receive job → { repoUrl, jobId, envVariables }
3.  git clone repoUrl into /tmp/jobId
4.  docker build -t image:jobId .
5.  docker push → ECR_URI/launchkube:jobId
6.  helm upgrade --install jobId ./helm-chart \
      --namespace jobId --create-namespace \
      --set image.repository=ECR_URI \
      --set image.tag=jobId
7.  Stream logs line by line → DB → frontend reads via SSE
8.  Update job status → deployed
9.  Delete SQS message
10. Clean up /tmp/jobId
```

---

## Security

- **EC2 worker** uses IAM Role — no access keys stored on the machine
- **Frontend** uses a dedicated IAM User scoped to `sqs:SendMessage` only
- **Zero static credentials** anywhere in the codebase
- Each deployment runs in its own **Kubernetes namespace** — full isolation between apps

---

## Why Kubernetes over ECS?

ECS just runs your container. Kubernetes orchestrates, watches, restarts, scales, and networks it. Building this meant understanding the layer that Vercel and Railway abstract away — pod scheduling, namespace isolation, Helm release management, Ingress routing. The goal was always to learn the internals, not just ship a product.

---

Built by [@rsxdev](https://rsxdev.co.in) | [YouTube — DevByRaghav](https://youtube.com/@DevByRaghav)
