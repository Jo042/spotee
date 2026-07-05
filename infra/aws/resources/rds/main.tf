data "aws_kms_key" "rds" {
  key_id = var.kms_key_id
}

resource "aws_db_instance" "this" {
  identifier     = var.identifier
  engine         = var.engine
  engine_version = var.engine_version
  instance_class = var.instance_class

  parameter_group_name = aws_db_parameter_group.this.name

  db_name  = var.db_name
  username = var.username
  password = var.password

  port                   = var.port
  db_subnet_group_name   = aws_db_subnet_group.this.name
  depends_on             = [aws_db_subnet_group.this]
  vpc_security_group_ids = var.vpc_security_group_ids
  multi_az               = var.multi_az
  publicly_accessible    = false

  storage_type          = var.storage_type
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_encrypted     = true
  kms_key_id            = data.aws_kms_key.rds.arn

  backup_retention_period         = var.backup_retention_period
  backup_window                   = var.backup_window
  maintenance_window              = var.maintenance_window
  auto_minor_version_upgrade      = var.auto_minor_version_upgrade
  copy_tags_to_snapshot           = var.copy_tags_to_snapshot
  skip_final_snapshot             = var.skip_final_snapshot
  deletion_protection             = var.deletion_protection
  monitoring_interval             = var.monitoring_interval
  enabled_cloudwatch_logs_exports = var.enabled_cloudwatch_logs_exports
  performance_insights_enabled    = var.performance_insights_enabled
}
