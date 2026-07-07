# RDS

rds_username              = "spotee_admin"
rds_db_name               = "spotee"
rds_instance_class        = "db.t3.micro"
rds_engine_version        = "16"
rds_multi_az              = false
rds_storage_type          = "gp3"
rds_allocated_storage     = 20
rds_max_allocated_storage = 0 # 0でストレージオートスケーリング無効
rds_kms_key_id            = "alias/aws/rds"

rds_backup_retention_period = 0 # 検証用のため自動バックアップは無効
rds_backup_window           = "18:00-18:30"
rds_maintenance_window      = "sun:19:00-sun:19:30"

rds_auto_minor_version_upgrade = true
rds_copy_tags_to_snapshot      = true
rds_skip_final_snapshot        = true
rds_deletion_protection        = false

rds_monitoring_interval             = 0 # 拡張モニタリングは使わず、基本のCloudWatchメトリクスで足りる範囲とする
rds_enabled_cloudwatch_logs_exports = ["postgresql"]
rds_performance_insights_enabled    = true # DBボトルネック観測が目的のため有効化（無料枠の範囲）
