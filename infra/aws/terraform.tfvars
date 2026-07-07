# 識別・provider系のみ。個人固有・機微な値（developer_ip_cidr, rds_password）は
# ここには書かず、TF_VAR_* 環境変数で渡す。
#
#   export TF_VAR_developer_ip_cidr="$(curl -s https://checkip.amazonaws.com)/32"
#   export TF_VAR_rds_password="$(openssl rand -base64 24)"

name_prefix = "spotee"
aws_region  = "ap-northeast-1"
