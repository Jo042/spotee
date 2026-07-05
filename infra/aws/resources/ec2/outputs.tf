output "ec2_instance_id" {
  description = "EC2インスタンスID"
  value       = aws_instance.main.id
}

output "ec2_private_ip" {
  description = "プライベートIP"
  value       = aws_instance.main.private_ip
}

output "ec2_public_ip" {
  description = "パブリックIP（付与されない場合はnullのことがあります）"
  value       = aws_instance.main.public_ip
}

output "ec2_availability_zone" {
  description = "配置AZ"
  value       = aws_instance.main.availability_zone
}

output "ec2_subnet_id" {
  description = "配置Subnet ID"
  value       = aws_instance.main.subnet_id
}

output "instance_id" {
  description = "作成したEC2インスタンスのID"
  value       = aws_instance.main.id
}
