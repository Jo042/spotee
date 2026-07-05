resource "aws_security_group" "this" {
  for_each = {
    for sg in var.security_groups : sg.name => sg
  }

  name        = each.value.name
  description = each.value.description
  vpc_id      = var.vpc_id

  revoke_rules_on_delete = true

  tags = {
    Name = each.value.name
  }
}

locals {
  ingress_items = flatten([
    for sg in var.security_groups : [
      for rule in sg.rules : rule.type == "ingress" ? {
        sg_name = sg.name
        rule    = rule
      } : null
    ]
  ])

  egress_items = flatten([
    for sg in var.security_groups : [
      for rule in sg.rules : rule.type == "egress" ? {
        sg_name = sg.name
        rule    = rule
      } : null
    ]
  ])
}

resource "aws_security_group_rule" "ingress_cidr" {
  for_each = {
    for item in flatten([
      for it in local.ingress_items : (
        it == null ? [] : [
          for c in try(it.rule.cidr_blocks, []) : {
            sg_name = it.sg_name
            rule    = it.rule
            cidr    = c
          }
        ]
      )
    ]) :
    "${item.sg_name}-ingress-${item.rule.protocol}-${item.rule.from_port}-${item.rule.to_port}-cidr-${item.cidr}" => item
    if item != null
  }

  type              = "ingress"
  security_group_id = aws_security_group.this[each.value.sg_name].id
  protocol          = each.value.rule.protocol
  from_port         = each.value.rule.from_port
  to_port           = each.value.rule.to_port
  cidr_blocks       = [each.value.cidr]
  description       = each.value.rule.description
}

resource "aws_security_group_rule" "ingress_prefix" {
  for_each = {
    for item in flatten([
      for it in local.ingress_items : (
        it == null ? [] : [
          for p in try(it.rule.prefix_list_ids, []) : {
            sg_name = it.sg_name
            rule    = it.rule
            pl      = p
          }
        ]
      )
    ]) :
    "${item.sg_name}-ingress-${item.rule.protocol}-${item.rule.from_port}-${item.rule.to_port}-pl-${item.pl}" => item
    if item != null
  }

  type              = "ingress"
  security_group_id = aws_security_group.this[each.value.sg_name].id
  protocol          = each.value.rule.protocol
  from_port         = each.value.rule.from_port
  to_port           = each.value.rule.to_port
  prefix_list_ids   = [each.value.pl]
  description       = each.value.rule.description
}

resource "aws_security_group_rule" "ingress_sg" {
  for_each = {
    for it in local.ingress_items :
    "${it.sg_name}-ingress-${it.rule.protocol}-${it.rule.from_port}-${it.rule.to_port}-sg-${try(it.rule.source_sg_name, "")}" => it
    if it != null && try(it.rule.source_sg_name, null) != null && try(it.rule.source_sg_name, "") != ""
  }

  type                     = "ingress"
  security_group_id        = aws_security_group.this[each.value.sg_name].id
  protocol                 = each.value.rule.protocol
  from_port                = each.value.rule.from_port
  to_port                  = each.value.rule.to_port
  source_security_group_id = aws_security_group.this[each.value.rule.source_sg_name].id
  description              = each.value.rule.description
}

resource "aws_security_group_rule" "egress_cidr" {
  for_each = {
    for item in flatten([
      for it in local.egress_items : (
        it == null ? [] : [
          for c in try(it.rule.cidr_blocks, []) : {
            sg_name = it.sg_name
            rule    = it.rule
            cidr    = c
          }
        ]
      )
    ]) :
    "${item.sg_name}-egress-${item.rule.protocol}-${item.rule.from_port}-${item.rule.to_port}-cidr-${item.cidr}" => item
    if item != null
  }

  type              = "egress"
  security_group_id = aws_security_group.this[each.value.sg_name].id
  protocol          = each.value.rule.protocol
  from_port         = each.value.rule.from_port
  to_port           = each.value.rule.to_port
  cidr_blocks       = [each.value.cidr]
  description       = each.value.rule.description
}

resource "aws_security_group_rule" "egress_prefix" {
  for_each = {
    for item in flatten([
      for it in local.egress_items : (
        it == null ? [] : [
          for p in try(it.rule.prefix_list_ids, []) : {
            sg_name = it.sg_name
            rule    = it.rule
            pl      = p
          }
        ]
      )
    ]) :
    "${item.sg_name}-egress-${item.rule.protocol}-${item.rule.from_port}-${item.rule.to_port}-pl-${item.pl}" => item
    if item != null
  }

  type              = "egress"
  security_group_id = aws_security_group.this[each.value.sg_name].id
  protocol          = each.value.rule.protocol
  from_port         = each.value.rule.from_port
  to_port           = each.value.rule.to_port
  prefix_list_ids   = [each.value.pl]
  description       = each.value.rule.description
}
