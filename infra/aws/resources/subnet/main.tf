locals {
  public_map  = { for s in var.public_subnets : s.name => s }
  private_map = { for s in var.private_subnets : s.name => s }
}

resource "aws_subnet" "public" {
  for_each = local.public_map

  vpc_id            = var.vpc_id
  cidr_block        = each.value.cidr_block
  availability_zone = each.value.availability_zone

  tags = { Name = each.value.name }
}

resource "aws_subnet" "private" {
  for_each = local.private_map

  vpc_id            = var.vpc_id
  cidr_block        = each.value.cidr_block
  availability_zone = each.value.availability_zone

  tags = { Name = each.value.name }
}
