variable "repository_name" {
  description = "ECRリポジトリ名"
  type        = string
}

variable "max_image_count" {
  description = "保持するイメージの世代数（超えた分は自動的に期限切れになる）"
  type        = number
  default     = 10
}
