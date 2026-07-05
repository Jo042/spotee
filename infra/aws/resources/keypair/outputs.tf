output "key_name" {
  description = "Key pair name"
  value       = var.key_name
}

output "private_key_path" {
  description = "秘密鍵ファイルのローカルパス（infra/aws/.keys/配下、gitignore対象）"
  value       = local_file.private_key.filename
}
