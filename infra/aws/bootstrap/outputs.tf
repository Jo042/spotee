output "state_bucket_name" {
  description = "作成したtfstate用S3バケット名。infra/aws/versions.tf の backend \"s3\" 設定にコピーする"
  value       = aws_s3_bucket.tfstate.bucket
}

output "state_bucket_arn" {
  value = aws_s3_bucket.tfstate.arn
}
