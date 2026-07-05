############################
# NACL
############################
output "public_nacl_id" {
  description = "作成されたPublic NACLのID"
  value       = try(aws_network_acl.public[0].id, null)
}

output "private_nacl_id" {
  description = "作成されたPrivate NACLのID"
  value       = try(aws_network_acl.private[0].id, null)
}
