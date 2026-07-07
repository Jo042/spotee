terraform {
  required_version = ">= 1.10.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }
  }

  # bootstrap-apply の出力（state_bucket_name）でbucketを置き換えてから `make init` すること。
  # OpenTofu 1.10+ の S3ネイティブロック（use_lockfile）を使うため、DynamoDBのロックテーブルは不要。
  backend "s3" {
    bucket       = "spotee-tfstate-539247480224"
    key          = "spotee/main.tfstate"
    region       = "ap-northeast-1"
    encrypt      = true
    use_lockfile = true
  }
}
