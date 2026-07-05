data "aws_caller_identity" "current" {}

locals {
  # 明示指定がなければ、アカウントIDを含めてグローバルユニークな名前を自動生成する
  bucket_name = coalesce(var.state_bucket_name, "spotee-tfstate-${data.aws_caller_identity.current.account_id}")
}

resource "aws_s3_bucket" "tfstate" {
  bucket = local.bucket_name

  tags = {
    Name    = local.bucket_name
    Purpose = "spotee-tfstate"
  }
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
