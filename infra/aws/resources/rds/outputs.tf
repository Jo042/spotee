output "db_instance_endpoint" {
  description = "RDSインスタンスの接続エンドポイント"
  value       = aws_db_instance.this.endpoint
}
