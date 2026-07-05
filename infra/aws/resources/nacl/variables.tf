############################
# 必須入力
############################
variable "vpc_id" {
  description = "適用対象VPCのID"
  type        = string
  default     = null
}

variable "public_subnet_ids_by_name" {
  description = "Public NACLを適用するサブネット (name => subnet_id)"
  type        = map(string)
  default     = {}
}

variable "private_subnet_ids_by_name" {
  description = "Private NACLを適用するサブネット (name => subnet_id)"
  type        = map(string)
  default     = {}
}

############################
# NACL設定
############################
variable "nacl_public_name" {
  description = "Public NACLの名前"
  type        = string
  default     = ""
}

variable "nacl_public_ingress_rules" {
  description = "Public NACLインバウンドルール"
  type = list(object({
    rule_number = number
    protocol    = string
    rule_action = string
    cidr_block  = string
    from_port   = number
    to_port     = number
  }))
  default = []
}

variable "nacl_public_egress_rules" {
  description = "Public NACLアウトバウンドルール"
  type = list(object({
    rule_number = number
    protocol    = string
    rule_action = string
    cidr_block  = string
    from_port   = number
    to_port     = number
  }))
  default = []
}

variable "nacl_private_name" {
  description = "Private NACLの名前"
  type        = string
  default     = ""
}

variable "nacl_private_ingress_rules" {
  description = "Private NACLインバウンドルール"
  type = list(object({
    rule_number = number
    protocol    = string
    rule_action = string
    cidr_block  = string
    from_port   = number
    to_port     = number
  }))
  default = []
}

variable "nacl_private_egress_rules" {
  description = "Private NACLアウトバウンドルール"
  type = list(object({
    rule_number = number
    protocol    = string
    rule_action = string
    cidr_block  = string
    from_port   = number
    to_port     = number
  }))
  default = []
}
