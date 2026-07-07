# アプリデプロイ（ECR）
# supabase_url / supabase_jwt_secret はここに書かず、値ができたら TF_VAR_* で渡す（database.auto.tfvarsのrds_passwordと同じ扱い）

ecr_max_image_count = 10
