output "cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_ca_certificate" {
  description = "Base64-encoded cluster CA certificate"
  value       = aws_eks_cluster.main.certificate_authority[0].data
}

output "ecr_repository_url_gateway" {
  value = aws_ecr_repository.repos["gateway"].repository_url
}

output "ecr_repository_url_auth_service" {
  value = aws_ecr_repository.repos["auth-service"].repository_url
}

output "ecr_repository_url_menu_service" {
  value = aws_ecr_repository.repos["menu-service"].repository_url
}

output "ecr_repository_url_order_service" {
  value = aws_ecr_repository.repos["order-service"].repository_url
}

output "ecr_repository_url_inventory_service" {
  value = aws_ecr_repository.repos["inventory-service"].repository_url
}

output "ecr_repository_url_loyalty_service" {
  value = aws_ecr_repository.repos["loyalty-service"].repository_url
}

output "ecr_repository_url_notification_service" {
  value = aws_ecr_repository.repos["notification-service"].repository_url
}

output "ecr_repository_url_frontend" {
  value = aws_ecr_repository.repos["frontend"].repository_url
}
