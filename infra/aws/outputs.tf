output "alb_dns_name" {
  description = "アプリへのアクセス先（ALB経由）"
  value       = module.alb.alb_dns_name
}

output "ec2_eip" {
  description = "backend EC2のEIP（SSH接続先）"
  value       = module.eip.public_ip
}

output "ec2_instance_id" {
  value = module.ec2.ec2_instance_id
}

output "rds_endpoint" {
  description = "RDSの接続エンドポイント（EC2経由のSSHトンネル越しに接続する）"
  value       = module.rds.db_instance_endpoint
}

output "ssh_private_key_path" {
  description = "SSH秘密鍵のローカルパス"
  value       = module.keypair.private_key_path
}

output "ecr_repository_url" {
  description = "ここにdocker buildしたイメージをpushする（例: docker push <値>:latest）"
  value       = module.ecr.repository_url
}
