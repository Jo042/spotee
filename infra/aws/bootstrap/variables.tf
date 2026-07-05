variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "state_bucket_name" {
  description = "tfstate用S3バケット名。未指定ならアカウントIDを含めて自動生成する"
  type        = string
  default     = null
}
