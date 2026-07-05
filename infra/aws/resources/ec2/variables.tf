############################
# EC2 module inputs
############################

variable "ec2_name_tag" {
  description = "EC2 Nameタグ（=マシン名扱い）"
  type        = string
}

variable "ec2_instance_type" {
  description = "インスタンスタイプ"
  type        = string
}

variable "ec2_ami_id" {
  description = "AMI ID。空文字ならSSM経由で最新のAmazon Linux 2023を自動解決する"
  type        = string
  default     = ""
}

variable "ec2_subnet_kind" {
  description = "public or private"
  type        = string
  validation {
    condition     = contains(["public", "private"], var.ec2_subnet_kind)
    error_message = "ec2_subnet_kind must be \"public\" or \"private\"."
  }
}

variable "ec2_subnet_name" {
  description = "サブネット名（任意）。空なら kind の先頭subnetを使う"
  type        = string
  default     = ""
}

# name→id 解決用（subnet module output を受け取る）
variable "subnet_ids_by_name" {
  description = "Subnet name -> Subnet ID"
  type        = map(string)
}

# 先頭subnet選択のための順序付き name リスト（tfvars順）
variable "public_subnet_names" {
  description = "public subnet name の順序付きリスト"
  type        = list(string)
}

variable "private_subnet_names" {
  description = "private subnet name の順序付きリスト"
  type        = list(string)
}

# SG 自動解決用（security module output: name->id）
variable "security_group_ids_by_name" {
  description = "SecurityGroup name -> id"
  type        = map(string)
  default     = {}
}

# 例外用：明示SG IDsを渡したい場合
variable "ec2_security_group_ids" {
  description = "EC2に付与するSecurity Group ID一覧。未指定(null)なら規定名(ec2_<name_tag>)で自動解決"
  type        = list(string)
  default     = null
}

variable "ec2_key_name" {
  description = "KeyPair名。空なら ec2_name_tag を使う"
  type        = string
  default     = ""
}

variable "ec2_iam_instance_profile" {
  description = "IAM instance profile。未使用ならnull"
  type        = string
  default     = null
}

variable "ec2_associate_public_ip_address" {
  description = "Public IP自動割当"
  type        = bool
}

variable "ec2_root_volume_size_gb" {
  description = "ルートボリュームサイズ"
  type        = number
}

variable "ec2_root_volume_type" {
  description = "ルートボリュームタイプ"
  type        = string
}

variable "ec2_enable_delete_on_termination" {
  description = "EBSの自動削除"
  type        = bool
  default     = true
}

variable "ec2_disable_api_termination" {
  description = "終了保護"
  type        = bool
}

variable "ec2_shutdown_behavior" {
  description = "シャットダウン動作"
  type        = string
  validation {
    condition     = contains(["stop", "terminate"], var.ec2_shutdown_behavior)
    error_message = "ec2_shutdown_behavior must be \"stop\" or \"terminate\"."
  }
}

variable "ec2_cpu_credits" {
  description = "CPUクレジット設定（standard/unlimited）。未指定なら省略"
  type        = string
  default     = null
  validation {
    condition     = var.ec2_cpu_credits == null || contains(["standard", "unlimited"], var.ec2_cpu_credits)
    error_message = "ec2_cpu_credits must be \"standard\" or \"unlimited\" (or null)."
  }
}

variable "ec2_tags" {
  description = "追加タグ"
  type        = map(string)
  default     = {}
}

variable "ec2_user_data" {
  description = "EC2起動時に実行するuser_data（Docker導入・アプリ起動スクリプト等）。未使用ならnull"
  type        = string
  default     = null
}
