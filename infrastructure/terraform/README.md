# AWS Terraform Deployment for OmniBite

This folder contains Terraform code to provision an AWS EKS cluster, supporting VPC, and ECR repositories used by the monorepo services.

Use this document to: (1) prepare credentials and IAM permissions, (2) run Terraform locally, (3) understand what the GitHub Actions workflow does, and (4) verify the created AWS resources.

---

## Preconditions (manual / local)

- AWS account with permissions to create VPC, EC2, EKS, IAM roles, ECR repositories, and related resources.
- Install these CLIs locally when testing manually:
	- `terraform` (>= 1.6.x)
	- `aws` CLI (v2)
	- `kubectl`
	- `docker` (if you will build/push images locally)

## Required GitHub repository secrets

- `AWS_ACCESS_KEY_ID` — access key with appropriate IAM permissions
- `AWS_SECRET_ACCESS_KEY` — secret key
- `AWS_REGION` — e.g. `us-east-1`

Note: The GitHub Actions workflow uses these secrets to run `terraform` and interact with AWS.

## Minimum IAM permissions for the user/role used by the workflow

The workflow requires permissions across EKS, EC2, VPC, IAM, ECR and STS. For convenience, attach the following AWS-managed policies to the user/role used by the workflow:

- `AmazonEKSClusterPolicy`
- `AmazonEKSServicePolicy`
- `AmazonEKSWorkerNodePolicy`
- `AmazonEC2ContainerRegistryFullAccess` (or `ReadOnly` + ECR create permissions)
- `AmazonEC2FullAccess` (or the narrower VPC/EC2 permissions for subnets, IGW)
- `IAMFullAccess` (or create/attach role policies used by EKS)

For production use, scope policies to least-privilege. The workflow also creates IAM roles for EKS and NodeGroups.

---

## Running Terraform locally (recommended verification steps)

1. Copy the example variables file and edit if needed:

```bash
cp infrastructure/terraform/terraform.tfvars.example infrastructure/terraform/terraform.tfvars
# Edit infrastructure/terraform/terraform.tfvars to tune region, cidrs, instance types
```

2. Initialize Terraform and download providers (cache pluggable):

```bash
terraform -chdir=infrastructure/terraform init
```

3. Validate, plan and apply (review plan before applying):

```bash
terraform -chdir=infrastructure/terraform validate
terraform -chdir=infrastructure/terraform plan -out=tfplan
terraform -chdir=infrastructure/terraform apply -auto-approve tfplan
```

4. After apply, view outputs:

```bash
terraform -chdir=infrastructure/terraform output
terraform -chdir=infrastructure/terraform output -raw cluster_name
terraform -chdir=infrastructure/terraform output -raw ecr_repository_url_gateway
```

---

## What the GitHub Actions workflow does (CI/CD)

- Runs monorepo build and frontend build.
- Runs `terraform init/validate/plan/apply` under `infrastructure/terraform` (this is the infra provisioning step).
- Reads Terraform outputs (cluster name, ECR repo URLs).
- Authenticates to ECR and uses `docker buildx` to build and push images for each service to the provisioned ECR repositories.
- Updates `kubectl` config (via `aws eks update-kubeconfig`) and applies `infrastructure/k8s` manifests after substituting image URLs.

If the workflow completes successfully you should see:

- EKS cluster created (check `terraform output cluster_name`)
- ECR repositories created and images pushed
- `kubectl get nodes` returns node(s)

---

## Verifying AWS resources after the run

1. Check Terraform outputs locally or via the runner logs:

```bash
terraform -chdir=infrastructure/terraform output
```

2. Check the EKS cluster exists and describe it:

```bash
aws eks describe-cluster --name <cluster_name> --region <region>
```

3. Update kubeconfig and verify nodes and namespaces:

```bash
aws eks update-kubeconfig --region <region> --name <cluster_name>
kubectl get nodes
kubectl get ns
kubectl get deployments -A
```

4. Verify ECR repositories and image list:

```bash
aws ecr describe-repositories --region <region>
aws ecr list-images --repository-name <repo-name> --region <region>
```

---

## Common troubleshooting

- If Terraform fails in GitHub Actions, open the Actions run log for the `terraform` job and inspect the `plan` / `apply` output.
- If `docker buildx` fails to push cache, ensure ECR repository exists and the IAM credentials allow `ecr:PutImage` and `ecr:InitiateLayerUpload`.
- If `kubectl apply` fails, check kubeconfig update step succeeded and the EKS cluster endpoint is reachable from GitHub's runner (it typically is via public control plane).
- If builds fail because of TypeScript or merge markers, fix source files locally, run `npm run build` and commit changes (this repo had merge markers which must be resolved before infra/deploy).

---

## Cleanup (destroy infra when you don't need it)

```bash
terraform -chdir=infrastructure/terraform destroy -auto-approve
```

Be careful: destroying will remove the EKS cluster and all ECR repositories and data.

---

## Notes about costs and security

- An EKS cluster + EC2 node group incurs running costs. Destroy the cluster when not needed.
- Use least-privilege IAM for CI credentials. Consider using OpenID Connect (OIDC) provider and GitHub Actions OIDC token to avoid long-lived AWS keys.

---

If you want, I can also:
- add an `infrastructure/terraform/outputs.md` with the exact keys used by the workflow,
- add an optional `make` file to standardize local commands,
- or configure GitHub Actions to use AWS OIDC provider to avoid storing long-lived secrets.

