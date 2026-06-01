variable "aws_region" {
  description = "AWS region where the cluster and supporting infrastructure will be deployed."
  type        = string
  default     = "us-east-1"
}

variable "cluster_name" {
  description = "Name of the EKS cluster."
  type        = string
  default     = "omnibus-eks-cluster"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDRs for the public subnets used by the EKS cluster."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "node_group_instance_types" {
  description = "EC2 instance types for the EKS managed node group."
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_group_desired_capacity" {
  description = "Desired number of worker nodes in the node group."
  type        = number
  default     = 3
}

variable "service_names" {
  description = "List of service names to create ECR repositories for."
  type        = list(string)
  default = [
    "gateway",
    "auth-service",
    "menu-service",
    "order-service",
    "inventory-service",
    "loyalty-service",
    "notification-service",
    "frontend"
  ]
}
