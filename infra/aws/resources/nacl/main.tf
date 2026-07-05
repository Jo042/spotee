locals {
  nacl_has_names = (
    trimspace(var.nacl_public_name) != "" &&
    trimspace(var.nacl_private_name) != ""
  )

  nacl_has_subnets = (
    length(keys(var.public_subnet_ids_by_name)) > 0 &&
    length(keys(var.private_subnet_ids_by_name)) > 0
  )

  nacl_is_empty = (
    trimspace(var.nacl_public_name) == "" &&
    trimspace(var.nacl_private_name) == "" &&
    length(var.nacl_public_ingress_rules) == 0 &&
    length(var.nacl_public_egress_rules) == 0 &&
    length(var.nacl_private_ingress_rules) == 0 &&
    length(var.nacl_private_egress_rules) == 0
  )

  nacl_is_configured = local.nacl_has_names && local.nacl_has_subnets

  nacl_enabled = local.nacl_is_configured
}

check "nacl_input_valid" {
  assert {
    condition     = local.nacl_is_empty || local.nacl_is_configured
    error_message = "NACLは「名前もルールも全部空（未作成）」か「public/privateのNACL名と対象サブネットが揃う（作成）」のどちらかにしてください。明示ルールがない場合は [] を指定できます。"
  }
}

############################
# Public NACL
############################
resource "aws_network_acl" "public" {
  count  = local.nacl_enabled ? 1 : 0
  vpc_id = var.vpc_id

  tags = {
    Name = var.nacl_public_name
  }
}

############################
# Public NACL Rules - Ingress
############################
resource "aws_network_acl_rule" "public_ingress" {
  for_each = local.nacl_enabled ? { for r in var.nacl_public_ingress_rules : r.rule_number => r } : {}

  network_acl_id = aws_network_acl.public[0].id
  rule_number    = each.value.rule_number
  egress         = false

  protocol    = each.value.protocol
  rule_action = each.value.rule_action
  cidr_block  = each.value.cidr_block
  from_port   = each.value.from_port
  to_port     = each.value.to_port
}

############################
# Public NACL Rules - Egress
############################
resource "aws_network_acl_rule" "public_egress" {
  for_each = local.nacl_enabled ? { for r in var.nacl_public_egress_rules : r.rule_number => r } : {}

  network_acl_id = aws_network_acl.public[0].id
  rule_number    = each.value.rule_number
  egress         = true

  protocol    = each.value.protocol
  rule_action = each.value.rule_action
  cidr_block  = each.value.cidr_block
  from_port   = each.value.from_port
  to_port     = each.value.to_port
}

############################
# Public Association
############################
resource "aws_network_acl_association" "public" {
  for_each = local.nacl_enabled ? var.public_subnet_ids_by_name : {}

  network_acl_id = aws_network_acl.public[0].id
  subnet_id      = each.value
}

############################
# Private NACL
############################
resource "aws_network_acl" "private" {
  count  = local.nacl_enabled ? 1 : 0
  vpc_id = var.vpc_id

  tags = {
    Name = var.nacl_private_name
  }
}

############################
# Private NACL Rules - Ingress
############################
resource "aws_network_acl_rule" "private_ingress" {
  for_each = local.nacl_enabled ? { for r in var.nacl_private_ingress_rules : r.rule_number => r } : {}

  network_acl_id = aws_network_acl.private[0].id
  rule_number    = each.value.rule_number
  egress         = false

  protocol    = each.value.protocol
  rule_action = each.value.rule_action
  cidr_block  = each.value.cidr_block
  from_port   = each.value.from_port
  to_port     = each.value.to_port
}

############################
# Private NACL Rules - Egress
############################
resource "aws_network_acl_rule" "private_egress" {
  for_each = local.nacl_enabled ? { for r in var.nacl_private_egress_rules : r.rule_number => r } : {}

  network_acl_id = aws_network_acl.private[0].id
  rule_number    = each.value.rule_number
  egress         = true

  protocol    = each.value.protocol
  rule_action = each.value.rule_action
  cidr_block  = each.value.cidr_block
  from_port   = each.value.from_port
  to_port     = each.value.to_port
}

############################
# Private Association
############################
resource "aws_network_acl_association" "private" {
  for_each = local.nacl_enabled ? var.private_subnet_ids_by_name : {}

  network_acl_id = aws_network_acl.private[0].id
  subnet_id      = each.value
}
