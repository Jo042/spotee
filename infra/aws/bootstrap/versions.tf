# bootstrapはローカルstateで管理する（S3 backendの置き場所自体をここで作るため、循環を避けている）
terraform {
  required_version = ">= 1.10.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
