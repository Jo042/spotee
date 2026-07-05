variable "public_route_table_name" {
  description = "パブリックルートテーブルの名前"
  type        = string
}

variable "private_route_table_names" {
  description = "プライベートルートテーブルの名前リスト"
  type        = list(string)
}

variable "public_subnet_ids" {
  description = "パブリックサブネットのIDリスト"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "プライベートサブネットのIDリスト"
  type        = list(string)
}

variable "vpc_id" {
  description = "VPCのID"
  type        = string
}

variable "igw_id" {
  description = "インターネットゲートウェイのID"
  type        = string
}
