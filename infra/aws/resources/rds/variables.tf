# ==========================================
# 必須変数 (Required)
# ==========================================

# データベースエンジン設定
# ※注意: AWSの仕様により、PostgreSQLを指定する場合は
# 「postgresql」ではなく「postgres」と入力してください。
variable "engine" {
  description = "データベースエンジン (許可される値: mysql, postgres, mariadb)"
  type        = string

  validation {
    condition     = contains(["mysql", "postgres", "mariadb"], var.engine)
    error_message = "指定された engine が無効です。「mysql」「postgres」「mariadb」のいずれかを指定してください。"
  }
}

variable "engine_version" {
  description = "データベースエンジンのバージョン"
  type        = string
}

variable "password" {
  description = "マスターユーザーのパスワード"
  type        = string
  sensitive   = true
}

variable "port" {
  description = "データベースのポート番号"
  type        = number
}

variable "vpc_security_group_ids" {
  description = "適用するセキュリティグループのIDリスト"
  type        = list(string)
}

variable "db_subnet_group_name" {
  description = "配置するDBサブネットグループ名"
  type        = string
}

variable "max_allocated_storage" {
  description = "ストレージの最大割り当て容量 (0でオートスケーリング無効)"
  type        = number
}

variable "auto_minor_version_upgrade" {
  description = "マイナーバージョンの自動アップグレード有効化"
  type        = bool
}

variable "copy_tags_to_snapshot" {
  description = "スナップショットへのタグのコピー有効化"
  type        = bool
}

variable "skip_final_snapshot" {
  description = "削除時の最終スナップショット作成をスキップするか"
  type        = bool
}

variable "monitoring_interval" {
  description = "拡張モニタリングのメトリクス収集間隔 (秒)。0で無効"
  type        = number
}

variable "enabled_cloudwatch_logs_exports" {
  description = "CloudWatch Logsへエクスポートするログの種類 (例: [\"postgresql\"])"
  type        = list(string)
}

# ==========================================
# オプション変数 (Optional)
# ==========================================
variable "identifier" {
  description = "DBインスタンス識別子"
  type        = string
}

variable "instance_class" {
  description = "DBインスタンスクラス"
  type        = string
}

variable "db_name" {
  description = "初期作成するデータベース名"
  type        = string
}

variable "username" {
  description = "マスターユーザー名"
  type        = string
}

variable "subnet_ids" {
  description = "DBサブネットグループに割り当てるサブネットIDのリスト"
  type        = list(string)
}

variable "multi_az" {
  description = "マルチAZ配置の有効化"
  type        = bool
}

variable "storage_type" {
  description = "ストレージタイプ (Wiki推奨値: gp3)"
  type        = string
}

variable "allocated_storage" {
  description = "割り当てストレージ容量 (GB)"
  type        = number
}

variable "kms_key_id" {
  description = "暗号化に使用するKMSキーのARNまたはエイリアス"
  type        = string
}

variable "backup_retention_period" {
  description = "バックアップ保持期間 (日)"
  type        = number
}

variable "backup_window" {
  description = "バックアップウィンドウ (UTC)"
  type        = string
}

variable "maintenance_window" {
  description = "メンテナンスウィンドウ (UTC)"
  type        = string
}

variable "deletion_protection" {
  description = "削除保護の有効化"
  type        = bool
}

variable "performance_insights_enabled" {
  description = "Performance Insightsの有効化"
  type        = bool
}

variable "vpc_id" {
  description = "RDSを配置するVPCのID"
  type        = string
}

variable "db_subnet_group_description" {
  description = "DBサブネットグループの説明"
  type        = string
}
