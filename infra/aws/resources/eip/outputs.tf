output "public_ip" {
  description = "割り当てたEIPのパブリックIP"
  value       = aws_eip.main.public_ip
}
