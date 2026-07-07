#!/bin/bash
set -euxo pipefail

exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

AWS_REGION="${aws_region}"
ECR_REPOSITORY_URL="${ecr_repository_url}"
SSM_PATH_PREFIX="${ssm_path_prefix}"
APP_PORT="${app_port}"
IMAGE_TAG="latest"
IMAGE="$ECR_REPOSITORY_URL:$IMAGE_TAG"
APP_DIR="/opt/spotee"

# 1. Docker導入
dnf install -y docker
systemctl enable --now docker
usermod -aG docker ec2-user

# 2. ECR認証（IAMロールの権限を使うので固定キーは不要）
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$${ECR_REPOSITORY_URL%%/*}"

# 3. イメージをpull
#    tofu applyの時点ではまだイメージがpushされていない可能性があるため、
#    手元からdocker pushされるのを待つリトライループにしている（最大10分）
for i in $(seq 1 40); do
  if docker pull "$IMAGE"; then
    break
  fi
  echo "image not ready yet, retrying in 15s ($i/40)..."
  sleep 15
done

# 4. SSM Parameter Storeから環境変数を取得して.envを生成
mkdir -p "$APP_DIR"
: > "$APP_DIR/.env"
for name in DATABASE_URL DIRECT_URL SUPABASE_JWT_SECRET SUPABASE_URL; do
  value=$(aws ssm get-parameter --name "$SSM_PATH_PREFIX/$name" --with-decryption \
    --query 'Parameter.Value' --output text --region "$AWS_REGION")
  echo "$name=$value" >> "$APP_DIR/.env"
done
echo "PORT=$APP_PORT" >> "$APP_DIR/.env"

# 5. マイグレーション実行
docker run --rm --env-file "$APP_DIR/.env" "$IMAGE" npx prisma migrate deploy

# 6. アプリ起動
docker rm -f spotee-backend 2>/dev/null || true
docker run -d --name spotee-backend --restart unless-stopped \
  --env-file "$APP_DIR/.env" \
  -p "$APP_PORT:$APP_PORT" \
  "$IMAGE"
