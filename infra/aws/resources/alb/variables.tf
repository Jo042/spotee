variable "alb_name" {
  description = "ALB名"
  type        = string
}

variable "public_subnet_ids" {
  description = "ALBを配置するパブリックサブネットID一覧"
  type        = list(string)
}

variable "target_groups" {
  description = "ターゲットグループ一覧"
  type = list(object({
    name = string
    port = number
  }))
}

variable "alb_sg_id" {
  description = "ALBに付与するSG"
  type        = string
}

variable "vpc_id" {
  description = "対象VPCのID"
  type        = string
}

variable "health_check_path" {
  description = "ヘルスチェックで使用するパス"
  type        = string
  default     = "/"
}

variable "health_check_matcher" {
  description = "ヘルスチェック成功コード"
  type        = string
  default     = "200"
}

variable "target_ids" {
  description = "ターゲットEC2のID一覧"
  type        = list(string)
}

variable "certificate_arn" {
  description = "ACM証明書ARN（空ならHTTPSリスナー作らない）"
  type        = string
  default     = ""
}

variable "enable_https" {
  description = "HTTPSリスナーを有効化するかどうか（certificate_arnが指定されている場合のみ有効）"
  type        = bool
  default     = false
}

variable "ssl_policy" {
  description = "ALBのSSLポリシー"
  type        = string
  default     = "ELBSecurityPolicy-FS-1-2-Res-2020-10"
}

variable "listener_rules" {
  description = "ALB Listener Rule 一覧"

  type = list(object({
    priority          = number
    path_pattern      = string
    target_group_name = string
  }))

  default = []
}

variable "default_target_group" {
  description = "デフォルトで転送するターゲットグループ名"
  type        = string
}
