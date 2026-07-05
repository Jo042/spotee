variable "key_name" {
  description = "EC2 Key Pair name"
  type        = string
  default     = null

  validation {
    condition     = var.key_name != null && var.key_name != ""
    error_message = "エラー: key_name が未定義か空です。terraform.tfvars 等で必ずキー名を指定してください。"
  }
}
