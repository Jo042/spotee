# ---------------------------
# Public Route Table
# ---------------------------
resource "aws_route_table" "public" {
  vpc_id = var.vpc_id

  tags = {
    Name = var.public_route_table_name
  }
}

# public: 0.0.0.0/0 -> IGW
resource "aws_route" "public_default_to_igw" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = var.igw_id
}

# Associate all public subnets -> public RT
resource "aws_route_table_association" "public" {
  count          = length(var.public_subnet_ids)
  subnet_id      = var.public_subnet_ids[count.index]
  route_table_id = aws_route_table.public.id
}

# ---------------------------
# Private Route Tables
# ---------------------------
resource "aws_route_table" "private" {
  count  = length(var.private_subnet_ids)
  vpc_id = var.vpc_id

  tags = {
    Name = var.private_route_table_names[count.index]
  }
}

# Privateサブネットとの関連付け
resource "aws_route_table_association" "private" {
  count          = length(var.private_subnet_ids)
  subnet_id      = var.private_subnet_ids[count.index]
  route_table_id = aws_route_table.private[count.index].id
}
