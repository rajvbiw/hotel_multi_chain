# Kubernetes Manifests for OmniBite

This folder contains the Kubernetes manifests needed to run OmniBite in a cluster and add Prometheus/Grafana monitoring.

## Apply the manifests

```bash
kubectl apply -f namespace.yaml
kubectl apply -f apps.yaml
kubectl apply -f seeder-job.yaml
kubectl apply -f monitoring/blackbox-config.yaml
kubectl apply -f monitoring/blackbox-deployment.yaml
kubectl apply -f monitoring/prometheus-config.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml
kubectl apply -f monitoring/grafana-config.yaml
kubectl apply -f monitoring/grafana-deployment.yaml
```

## Build local images

If you are running a local cluster (Docker Desktop, kind, minikube), build the images first:

```bash
docker build -t hotel_multi_chain-auth-service:latest -f services/auth-service/Dockerfile .
docker build -t hotel_multi_chain-menu-service:latest -f services/menu-service/Dockerfile .
docker build -t hotel_multi_chain-order-service:latest -f services/order-service/Dockerfile .
docker build -t hotel_multi_chain-inventory-service:latest -f services/inventory-service/Dockerfile .
docker build -t hotel_multi_chain-loyalty-service:latest -f services/loyalty-service/Dockerfile .
docker build -t hotel_multi_chain-notification-service:latest -f services/notification-service/Dockerfile .
docker build -t hotel_multi_chain-gateway:latest -f services/gateway/Dockerfile .
docker build --build-arg VITE_GATEWAY_URL=http://<gateway-host>:<gateway-port> -t hotel_multi_chain-frontend:latest -f frontend/Dockerfile .
docker build -t hotel_multi_chain-seeder:latest -f services/menu-service/Dockerfile .
```

## Notes

- `prometheus` is deployed in the `monitoring` namespace.
- `grafana` is provisioned with a Prometheus datasource.
- Use `kubectl port-forward` if LoadBalancer services are not available in your cluster.
