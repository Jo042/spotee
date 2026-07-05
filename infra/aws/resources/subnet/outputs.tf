output "public_subnet_ids" {
  value = [for s in aws_subnet.public : s.id]
}

output "private_subnet_ids" {
  value = [for s in aws_subnet.private : s.id]
}

output "public_subnet_ids_by_name" {
  value = { for name, s in aws_subnet.public : name => s.id }
}

output "private_subnet_ids_by_name" {
  value = { for name, s in aws_subnet.private : name => s.id }
}

output "subnet_ids_by_name" {
  value = merge(
    { for name, s in aws_subnet.public : name => s.id },
    { for name, s in aws_subnet.private : name => s.id }
  )
}
