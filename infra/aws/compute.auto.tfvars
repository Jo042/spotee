# backend EC2

ec2_instance_type           = "t3.micro"
ec2_root_volume_size_gb     = 20
ec2_root_volume_type        = "gp3"
ec2_cpu_credits             = "standard" # CPUバースト枯渇を観測したいため unlimited にしない
ec2_disable_api_termination = false
ec2_shutdown_behavior       = "stop"
