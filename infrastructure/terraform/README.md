# AWS Terraform Deployment for OmniBite

This folder contains Terraform infrastructure as code for provisioning an AWS EKS cluster and ECR repositories for the microservices.

## What is included

- VPC with public subnets
- Internet Gateway and route table
- EKS cluster and managed node group
- ECR repositories for each application service

## How to use

1. Copy the example variables file:

```bash
cp infrastructure/terraform/terraform.tfvars.example infrastructure/terraform/terraform.tfvars
```

2. Update `infrastructure/terraform/terraform.tfvars` if needed.

3. Initialize Terraform:

```bash
terraform -chdir=infrastructure/terraform init
```

4. Validate and apply:

```bash
terraform -chdir=infrastructure/terraform validate
terraform -chdir=infrastructure/terraform plan -out=tfplan
terraform -chdir=infrastructure/terraform apply -auto-approve tfplan
```

## GitHub Actions

The workflow file `.github/workflows/terraform-deploy.yml` will:

- provision the AWS infrastructure with Terraform
- build Docker images for the monorepo services
- push images to ECR
- deploy Kubernetes manifests to the new EKS cluster

## Required GitHub secrets

Set the following repository secrets before running the workflow:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

## Notes

- The Kubernetes manifests are located in `infrastructure/k8s/all-services.yaml`.
- The workflow pushes images with the `latest` tag to ECR.
- The frontend uses `VITE_API_URL=http://gateway:5000` inside the cluster.
