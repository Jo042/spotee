check "subnet_topology_consistent" {
  assert {
    condition = (
      length(var.availability_zones) == length(var.public_subnet_cidrs) &&
      length(var.availability_zones) == length(var.private_subnet_cidrs)
    )
    error_message = "availability_zones / public_subnet_cidrs / private_subnet_cidrs は同じ要素数にしてください。"
  }
}

locals {
  ec2_name_tag = "${var.name_prefix}-backend"
  ec2_sg_name  = "ec2_${local.ec2_name_tag}" # ec2モジュールの規定名解決ルールに合わせる
  alb_sg_name  = "alb_${var.name_prefix}"
  rds_sg_name  = "rds_${var.name_prefix}"

  ecr_repository_name = "${var.name_prefix}-backend"
  ec2_role_name       = "${var.name_prefix}-ec2-role"
  ssm_path_prefix     = "/${var.name_prefix}/backend"

  # RDSのエンドポイント・パスワードから接続文字列を組み立て、SSM Parameter Storeに格納する。
  # Prisma/PostgreSQLの都合上 DIRECT_URL も同じ接続先を指す。
  database_url = "postgresql://${var.rds_username}:${var.rds_password}@${module.rds.db_instance_endpoint}/${var.rds_db_name}?schema=public"

  # backendが読む環境変数一式。SUPABASE_* は未設定（空文字）のままでも動く。
  # for_eachのキーにsensitiveな値を使えないため、名前(非機微)と値(機微)を分けて持つ。
  app_secret_names        = ["DATABASE_URL", "DIRECT_URL", "SUPABASE_JWT_SECRET", "SUPABASE_URL"]
  app_secure_secret_names = ["DATABASE_URL", "DIRECT_URL", "SUPABASE_JWT_SECRET"]
  app_secret_values = {
    DATABASE_URL        = local.database_url
    DIRECT_URL          = local.database_url
    SUPABASE_JWT_SECRET = var.supabase_jwt_secret
    SUPABASE_URL        = var.supabase_url
  }

  public_subnets = [
    for idx, az in var.availability_zones : {
      name              = "${var.name_prefix}-public-${az}"
      cidr_block        = var.public_subnet_cidrs[idx]
      availability_zone = "${var.aws_region}${az}"
    }
  ]

  private_subnets = [
    for idx, az in var.availability_zones : {
      name              = "${var.name_prefix}-private-${az}"
      cidr_block        = var.private_subnet_cidrs[idx]
      availability_zone = "${var.aws_region}${az}"
    }
  ]

  security_groups = [
    {
      name        = local.alb_sg_name
      description = "ALB: allow HTTP only from developer IP"
      rules = [
        {
          type        = "ingress"
          protocol    = "tcp"
          from_port   = var.alb_listener_port
          to_port     = var.alb_listener_port
          description = "HTTP from developer IP"
          cidr_blocks = [var.developer_ip_cidr]
        },
        {
          type        = "egress"
          protocol    = "-1"
          from_port   = 0
          to_port     = 0
          description = "allow all outbound"
          cidr_blocks = ["0.0.0.0/0"]
        },
      ]
    },
    {
      name        = local.ec2_sg_name
      description = "Spotee backend EC2: SSH from developer IP only, app port from ALB only"
      rules = [
        {
          type        = "ingress"
          protocol    = "tcp"
          from_port   = var.ssh_port
          to_port     = var.ssh_port
          description = "SSH from developer IP"
          cidr_blocks = [var.developer_ip_cidr]
        },
        {
          type           = "ingress"
          protocol       = "tcp"
          from_port      = var.app_port
          to_port        = var.app_port
          description    = "App port from ALB"
          source_sg_name = local.alb_sg_name
        },
        {
          type        = "egress"
          protocol    = "-1"
          from_port   = 0
          to_port     = 0
          description = "allow all outbound"
          cidr_blocks = ["0.0.0.0/0"]
        },
      ]
    },
    {
      name        = local.rds_sg_name
      description = "Spotee RDS: allow Postgres only from backend EC2"
      rules = [
        {
          type           = "ingress"
          protocol       = "tcp"
          from_port      = var.rds_port
          to_port        = var.rds_port
          description    = "Postgres from backend EC2"
          source_sg_name = local.ec2_sg_name
        },
        {
          type        = "egress"
          protocol    = "-1"
          from_port   = 0
          to_port     = 0
          description = "allow all outbound"
          cidr_blocks = ["0.0.0.0/0"]
        },
      ]
    },
  ]
}

module "vpc" {
  source = "./resources/vpc"

  vpc_name             = "${var.name_prefix}-vpc"
  vpc_cidr             = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
}

module "igw" {
  source = "./resources/igw"

  vpc_id   = module.vpc.vpc_id
  igw_name = "${var.name_prefix}-igw"
}

module "subnet" {
  source = "./resources/subnet"

  vpc_id          = module.vpc.vpc_id
  public_subnets  = local.public_subnets
  private_subnets = local.private_subnets
}

module "route_table" {
  source = "./resources/route_table"

  vpc_id = module.vpc.vpc_id
  igw_id = module.igw.igw_id

  public_subnet_ids  = module.subnet.public_subnet_ids
  private_subnet_ids = module.subnet.private_subnet_ids

  public_route_table_name   = "${var.name_prefix}-public-rt"
  private_route_table_names = [for s in local.private_subnets : "${var.name_prefix}-private-rt-${s.availability_zone}"]
}

module "nacl" {
  source = "./resources/nacl"

  vpc_id                     = module.vpc.vpc_id
  public_subnet_ids_by_name  = module.subnet.public_subnet_ids_by_name
  private_subnet_ids_by_name = module.subnet.private_subnet_ids_by_name

  nacl_public_name  = "${var.name_prefix}-public-nacl"
  nacl_private_name = "${var.name_prefix}-private-nacl"

  nacl_public_ingress_rules  = var.nacl_public_ingress_rules
  nacl_public_egress_rules   = var.nacl_public_egress_rules
  nacl_private_ingress_rules = var.nacl_private_ingress_rules
  nacl_private_egress_rules  = var.nacl_private_egress_rules
}

module "security" {
  source = "./resources/security"

  vpc_id          = module.vpc.vpc_id
  security_groups = local.security_groups
}

module "keypair" {
  source = "./resources/keypair"

  key_name = "${var.name_prefix}-key"
}

module "ecr" {
  source = "./resources/ecr"

  repository_name = local.ecr_repository_name
  max_image_count = var.ecr_max_image_count
}

module "ssm_parameters" {
  source = "./resources/ssm_parameter"

  path_prefix            = local.ssm_path_prefix
  parameter_names        = local.app_secret_names
  parameter_values       = local.app_secret_values
  secure_parameter_names = local.app_secure_secret_names
}

module "iam" {
  source = "./resources/iam"

  role_name          = local.ec2_role_name
  ecr_repository_arn = module.ecr.repository_arn
  ssm_parameter_arns = values(module.ssm_parameters.parameter_arns)
}

module "ec2" {
  source = "./resources/ec2"

  ec2_name_tag      = local.ec2_name_tag
  ec2_instance_type = var.ec2_instance_type
  ec2_ami_id        = "" # 空: SSM経由で最新のAmazon Linux 2023を自動解決

  ec2_subnet_kind = "public"
  ec2_subnet_name = local.public_subnets[0].name

  subnet_ids_by_name   = module.subnet.subnet_ids_by_name
  public_subnet_names  = [for s in local.public_subnets : s.name]
  private_subnet_names = [for s in local.private_subnets : s.name]

  security_group_ids_by_name = module.security.security_group_ids

  ec2_key_name             = module.keypair.key_name
  ec2_iam_instance_profile = module.iam.instance_profile_name

  ec2_associate_public_ip_address = true
  ec2_root_volume_size_gb         = var.ec2_root_volume_size_gb
  ec2_root_volume_type            = var.ec2_root_volume_type
  ec2_disable_api_termination     = var.ec2_disable_api_termination
  ec2_shutdown_behavior           = var.ec2_shutdown_behavior
  ec2_cpu_credits                 = var.ec2_cpu_credits

  ec2_user_data = templatefile("${path.module}/templates/user_data.sh.tpl", {
    aws_region         = var.aws_region
    ecr_repository_url = module.ecr.repository_url
    ssm_path_prefix    = local.ssm_path_prefix
    app_port           = var.app_port
  })

  ec2_tags = {
    Role = "backend"
  }
}

module "eip" {
  source = "./resources/eip"

  ec2_instance_id = module.ec2.ec2_instance_id
  ec2_name_tag    = local.ec2_name_tag
}

module "alb" {
  source = "./resources/alb"

  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.subnet.public_subnet_ids
  alb_sg_id         = module.security.security_group_ids[local.alb_sg_name]
  alb_name          = "${var.name_prefix}-alb"

  target_groups = [
    { name = "${var.name_prefix}-backend-tg", port = var.app_port },
  ]
  default_target_group = "${var.name_prefix}-backend-tg"

  target_ids = [module.ec2.ec2_instance_id]

  health_check_path    = var.alb_health_check_path
  health_check_matcher = var.alb_health_check_matcher
}

module "rds" {
  source = "./resources/rds"

  identifier     = "${var.name_prefix}-db"
  engine         = "postgres"
  engine_version = var.rds_engine_version
  instance_class = var.rds_instance_class

  db_name  = var.rds_db_name
  username = var.rds_username
  password = var.rds_password
  port     = var.rds_port

  vpc_id                      = module.vpc.vpc_id
  vpc_security_group_ids      = [module.security.security_group_ids[local.rds_sg_name]]
  subnet_ids                  = module.subnet.private_subnet_ids
  db_subnet_group_name        = "${var.name_prefix}-db-subnet-group"
  db_subnet_group_description = "Spotee RDS subnet group"

  multi_az = var.rds_multi_az

  storage_type          = var.rds_storage_type
  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  kms_key_id            = var.rds_kms_key_id

  backup_retention_period = var.rds_backup_retention_period
  backup_window           = var.rds_backup_window
  maintenance_window      = var.rds_maintenance_window

  auto_minor_version_upgrade = var.rds_auto_minor_version_upgrade
  copy_tags_to_snapshot      = var.rds_copy_tags_to_snapshot
  skip_final_snapshot        = var.rds_skip_final_snapshot
  deletion_protection        = var.rds_deletion_protection

  monitoring_interval             = var.rds_monitoring_interval
  enabled_cloudwatch_logs_exports = var.rds_enabled_cloudwatch_logs_exports
  performance_insights_enabled    = var.rds_performance_insights_enabled
}
