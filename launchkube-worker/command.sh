#!/bin/sh
set -e
set -a
source /path/to/.env
set +a

REPO_URL=$1
JOB_ID="$2"
ENV_VARS=$3

REPO_NAME=$(basename "$REPO_URL")
REPO_NAME=${REPO_NAME%.git}

echo "🚀 Job: $JOB_ID"
echo "📦 Repo: $REPO_NAME"

mkdir -p projects
cd projects || exit

WORK_DIR="${JOB_ID}-${REPO_NAME}"

if [ -d "$WORK_DIR" ]; then
  echo "Repo exists → pulling latest"
  cd "$WORK_DIR" || exit
  git pull
else
  echo "Cloning repo..."
  git clone "$REPO_URL" "$WORK_DIR"
  cd "$WORK_DIR" || exit
fi

echo "📄 Copying Dockerfile..."
cp ../../docker/Dockerfile ./Dockerfile

echo "Creating dummy env variables"
echo "$ENV_VARS" | jq -r '.[] | "\(.key)=dummy"' > .env.build

echo "Docker Login..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "🐳 Building Docker image..."

IMAGE_LOCAL="$REPO_NAME:$JOB_ID"
ECR_REPO="$ECR_REPO_NAME"
IMAGE_ECR="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$JOB_ID"
ECR_REPO_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO"

docker build -t $IMAGE_LOCAL . 

docker tag "$IMAGE_LOCAL" "$IMAGE_ECR"
docker push "$IMAGE_ECR"

rm .env.build

echo "Deleting local docker images...."
docker rmi "$IMAGE_ECR"
docker rmi "$IMAGE_LOCAL"

echo "📦 Setting up Helm chart..."

RELEASE_NAME="app-$JOB_ID"
NAMESPACE="$RELEASE_NAME-ns"
SECRET_NAME="$RELEASE_NAME-secret"

# optional: copy only if not exists
if [ ! -d "./chart" ]; then
  cp -r ../../next-app-chart ./chart
fi

echo "Creating project namespace..."
kubectl create namespace "$NAMESPACE"

echo "🔐 Creating K8s secret..."
ENV_FILE="/tmp/env-$JOB_ID"

cleanup() {
  rm -f "$ENV_FILE"
}

trap cleanup EXIT

echo "$ENV_VARS" | jq -r '.[] | "\(.key)=\(.value)"' > "$ENV_FILE"
kubectl create secret generic "$SECRET_NAME" --from-file=.env="$ENV_FILE" -n "$NAMESPACE"


helm upgrade --install "$RELEASE_NAME" ./chart \
  -n $RELEASE_NAME-ns \
  --set image.repository="$ECR_REPO_URL" \
  --set image.tag="$JOB_ID" \
  --set image.pullPolicy=IfNotPresent \
  --set app.name="$RELEASE_NAME" \
  --set replicaCount=1 \
  --set service.enabled=true \
  --set service.type=ClusterIP \
  --set service.port=80 \
  --set ingress.enabled=true \
  --set ingress.host="$RELEASE_NAME.rsxdev.co.in" \
  --set ingress.className=nginx \
  --set hpa.enabled=false

echo "✅ Your app deployed on:"
echo "http://$RELEASE_NAME.rsxdev.co.in"
