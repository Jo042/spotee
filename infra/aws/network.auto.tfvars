# VPC / サブネット / ポート / NACL

vpc_cidr             = "10.0.0.0/16"
availability_zones   = ["a", "c"]
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.11.0/24", "10.0.12.0/24"]

ssh_port          = 22
alb_listener_port = 80
app_port          = 4000
rds_port          = 5432

# NACLは最小構成（全許可）。実効的なアクセス制御はSecurity Group側で行う。
nacl_public_ingress_rules = [
  { rule_number = 100, protocol = "-1", rule_action = "allow", cidr_block = "0.0.0.0/0", from_port = 0, to_port = 0 },
]
nacl_public_egress_rules = [
  { rule_number = 100, protocol = "-1", rule_action = "allow", cidr_block = "0.0.0.0/0", from_port = 0, to_port = 0 },
]
nacl_private_ingress_rules = [
  # cidr_block は上の vpc_cidr と同じ値にすること（tfvars内では変数参照ができないため手動同期）
  { rule_number = 100, protocol = "-1", rule_action = "allow", cidr_block = "10.0.0.0/16", from_port = 0, to_port = 0 },
]
nacl_private_egress_rules = [
  { rule_number = 100, protocol = "-1", rule_action = "allow", cidr_block = "0.0.0.0/0", from_port = 0, to_port = 0 },
]
