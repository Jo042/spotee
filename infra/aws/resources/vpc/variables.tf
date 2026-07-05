variable "vpc_name" {
  description = "VPCのNameタグに設定する名前"
  type        = string
}

variable "vpc_cidr" {
  description = "VPCのCIDRブロック"
  type        = string
}

variable "enable_dns_hostnames" {
  description = "VPCでDNSホスト名を有効化するか"
  type        = bool
}

variable "enable_dns_support" {
  description = "VPCでDNS解決を有効化するか"
  type        = bool
}
