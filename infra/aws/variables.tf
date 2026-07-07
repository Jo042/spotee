############################
# Naming / Provider
############################
variable "name_prefix" {
  description = "全リソース名の共通プレフィックス"
  type        = string
  default     = "spotee"
}

variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

############################
# 個人固有・機微な値（tfvarsにコミットしない。TF_VAR_* 環境変数で渡す）
############################
variable "developer_ip_cidr" {
  description = "Security Groupのインバウンドを許可する開発者のグローバルIP（例: 203.0.113.5/32）。TF_VAR_developer_ip_cidr で渡す想定で、コミットするtfvarsには書かない"
  type        = string

  validation {
    condition     = can(cidrnetmask(var.developer_ip_cidr))
    error_message = "developer_ip_cidr はCIDR表記（例: 203.0.113.5/32）で指定してください。"
  }
}

variable "rds_password" {
  description = "RDSマスターパスワード。TF_VAR_rds_password で渡す想定で、コミットするtfvarsには書かない"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.rds_password) >= 8
    error_message = "rds_password は8文字以上にしてください。"
  }
}

############################
# Network
############################
variable "vpc_cidr" {
  description = "VPCのCIDRブロック"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "使用するAZのサフィックス（リージョン名に続けて結合する。例: \"a\" -> ap-northeast-1a）。public/private双方のサブネットで共通して使う"
  type        = list(string)
  default     = ["a", "c"]
}

variable "public_subnet_cidrs" {
  description = "publicサブネットのCIDR一覧（availability_zonesと同じ順序・同じ要素数）"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "privateサブネットのCIDR一覧（availability_zonesと同じ順序・同じ要素数）"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

############################
# ポート
############################
variable "ssh_port" {
  description = "backend EC2へのSSHポート"
  type        = number
  default     = 22
}

variable "alb_listener_port" {
  description = "ALBのHTTPリスナーポート"
  type        = number
  default     = 80
}

variable "app_port" {
  description = "Spoteeバックエンド（NestJS）のアプリケーションポート"
  type        = number
  default     = 4000
}

variable "rds_port" {
  description = "RDS(PostgreSQL)のポート"
  type        = number
  default     = 5432
}

############################
# NACL（最小構成: 全許可。実効的なアクセス制御はSecurity Group側で行う）
############################
variable "nacl_public_ingress_rules" {
  type = list(object({
    rule_number = number
    protocol    = string
    rule_action = string
    cidr_block  = string
    from_port   = number
    to_port     = number
  }))
  default = [
    { rule_number = 100, protocol = "-1", rule_action = "allow", cidr_block = "0.0.0.0/0", from_port = 0, to_port = 0 },
  ]
}

variable "nacl_public_egress_rules" {
  type = list(object({
    rule_number = number
    protocol    = string
    rule_action = string
    cidr_block  = string
    from_port   = number
    to_port     = number
  }))
  default = [
    { rule_number = 100, protocol = "-1", rule_action = "allow", cidr_block = "0.0.0.0/0", from_port = 0, to_port = 0 },
  ]
}

variable "nacl_private_ingress_rules" {
  type = list(object({
    rule_number = number
    protocol    = string
    rule_action = string
    cidr_block  = string
    from_port   = number
    to_port     = number
  }))
  default = [
    { rule_number = 100, protocol = "-1", rule_action = "allow", cidr_block = "10.0.0.0/16", from_port = 0, to_port = 0 },
  ]
}

variable "nacl_private_egress_rules" {
  type = list(object({
    rule_number = number
    protocol    = string
    rule_action = string
    cidr_block  = string
    from_port   = number
    to_port     = number
  }))
  default = [
    { rule_number = 100, protocol = "-1", rule_action = "allow", cidr_block = "0.0.0.0/0", from_port = 0, to_port = 0 },
  ]
}

############################
# EC2
############################
variable "ec2_instance_type" {
  description = "バックエンドEC2のインスタンスタイプ（負荷検証中にサイズを変えて比較する想定）"
  type        = string
  default     = "t3.micro"
}

variable "ec2_root_volume_size_gb" {
  description = "backend EC2のルートボリュームサイズ(GB)"
  type        = number
  default     = 20
}

variable "ec2_root_volume_type" {
  description = "backend EC2のルートボリュームタイプ"
  type        = string
  default     = "gp3"
}

variable "ec2_cpu_credits" {
  description = "backend EC2のCPUクレジット設定（standard/unlimited）。CPUバースト枯渇を観測したい場合はstandardのままにする"
  type        = string
  default     = "standard"
}

variable "ec2_disable_api_termination" {
  description = "backend EC2の終了保護"
  type        = bool
  default     = false
}

variable "ec2_shutdown_behavior" {
  description = "backend EC2のシャットダウン動作(stop/terminate)"
  type        = string
  default     = "stop"
}

############################
# RDS
############################
variable "rds_username" {
  description = "RDSマスターユーザー名"
  type        = string
  default     = "spotee_admin"
}

variable "rds_db_name" {
  description = "初期作成するデータベース名"
  type        = string
  default     = "spotee"
}

variable "rds_instance_class" {
  description = "RDSのインスタンスクラス（負荷検証中にサイズを変えて比較する想定）"
  type        = string
  default     = "db.t3.micro"
}

variable "rds_engine_version" {
  description = "PostgreSQLのバージョン（メジャーのみ指定可）"
  type        = string
  default     = "16"
}

variable "rds_multi_az" {
  description = "マルチAZ配置の有効化（今回のスコープでは無効のまま運用）"
  type        = bool
  default     = false
}

variable "rds_storage_type" {
  description = "RDSのストレージタイプ"
  type        = string
  default     = "gp3"
}

variable "rds_allocated_storage" {
  description = "RDSの割り当てストレージ容量(GB)"
  type        = number
  default     = 20
}

variable "rds_max_allocated_storage" {
  description = "RDSストレージの最大割り当て容量（0でオートスケーリング無効）"
  type        = number
  default     = 0
}

variable "rds_kms_key_id" {
  description = "RDS暗号化に使うKMSキーのARNまたはエイリアス"
  type        = string
  default     = "alias/aws/rds"
}

variable "rds_backup_retention_period" {
  description = "自動バックアップ保持期間(日)。検証用途のため既定は無効(0)"
  type        = number
  default     = 0
}

variable "rds_backup_window" {
  description = "バックアップウィンドウ(UTC)"
  type        = string
  default     = "18:00-18:30"
}

variable "rds_maintenance_window" {
  description = "メンテナンスウィンドウ(UTC)"
  type        = string
  default     = "sun:19:00-sun:19:30"
}

variable "rds_auto_minor_version_upgrade" {
  type    = bool
  default = true
}

variable "rds_copy_tags_to_snapshot" {
  type    = bool
  default = true
}

variable "rds_skip_final_snapshot" {
  description = "destroy時に最終スナップショットを作らずに削除できるようにする（検証環境のため既定でtrue）"
  type        = bool
  default     = true
}

variable "rds_deletion_protection" {
  description = "削除保護。destroyで壊せるように既定はfalse"
  type        = bool
  default     = false
}

variable "rds_monitoring_interval" {
  description = "拡張モニタリングの収集間隔(秒)。0で無効。有効にする場合はIAMロールの追加実装が必要"
  type        = number
  default     = 0
}

variable "rds_enabled_cloudwatch_logs_exports" {
  description = "CloudWatch Logsへエクスポートするログ種別"
  type        = list(string)
  default     = ["postgresql"]
}

variable "rds_performance_insights_enabled" {
  description = "Performance Insightsの有効化（DBボトルネック観測が目的のため既定で有効。無料枠の範囲）"
  type        = bool
  default     = true
}

############################
# ALB
############################
variable "alb_health_check_path" {
  description = "ALBヘルスチェックパス（backendの GET / が疎通・DB接続確認を兼ねている）"
  type        = string
  default     = "/"
}

variable "alb_health_check_matcher" {
  description = "ALBヘルスチェック成功コード"
  type        = string
  default     = "200"
}

############################
# アプリデプロイ（ECR / アプリ環境変数）
############################
variable "ecr_max_image_count" {
  description = "ECRに保持するイメージの世代数（超えた分は自動的に期限切れになる）"
  type        = number
  default     = 10
}

variable "supabase_url" {
  description = "検証用SupabaseプロジェクトのURL。未設定（\"unset\"）の間は認証が動作しない。SSM Parameter Storeが空文字を許可しないためダミー値をデフォルトにしている"
  type        = string
  default     = "unset"
}

variable "supabase_jwt_secret" {
  description = "検証用SupabaseプロジェクトのJWT Secret。未設定（\"unset\"）の間は認証が動作しない。TF_VAR_supabase_jwt_secret で渡す想定で、コミットするtfvarsには書かない"
  type        = string
  default     = "unset"
  sensitive   = true
}
