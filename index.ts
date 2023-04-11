import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

import {
  clusterProvider,
  inputName,
  kubeconfig as config,
  clusterNameOutput,
} from "./providerCFG";
import { database } from "./cloudsql";

// Create a Kubernetes Namespace
const ns = new k8s.core.v1.Namespace(
  inputName,
  {},
  { provider: clusterProvider }
);
// Export the namespace name
export const namespaceName = ns.metadata.apply((m) => m.name);

const appLabels = { appClass: inputName };
const cfg = new pulumi.Config();

// Create a Deployment
const deployment = new k8s.apps.v1.Deployment(
  inputName,
  {
    metadata: {
      namespace: namespaceName,
      labels: appLabels,
    },
    spec: {
      replicas: 1,
      selector: { matchLabels: appLabels },
      template: {
        metadata: {
          labels: appLabels,
        },
        spec: {
          containers: [
            {
              name: inputName,
              image: "luillyfe/nextjs-blog:latest",
              ports: [{ name: "http", containerPort: 80 }],
              env: [
                {
                  name: "INSTANCE_HOST",
                  value: cfg.requireSecret("instanceHost"),
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    provider: clusterProvider,
  }
);

// Export the Deployment name
export const deploymentName = deployment.metadata.apply((m) => m.name);

// Create a LoadBalancer Service for the Deployment
const service = new k8s.core.v1.Service(
  inputName,
  {
    metadata: {
      labels: appLabels,
      namespace: namespaceName,
    },
    spec: {
      type: "LoadBalancer",
      ports: [{ port: 80, targetPort: "http" }],
      selector: appLabels,
    },
  },
  {
    provider: clusterProvider,
    dependsOn: [deployment],
  }
);

// Export the Service name and public LoadBalancer endpoint, DatabaseName, ClusterName
export const serviceName = service.metadata.apply((m) => m.name);
export const servicePublicIP = service.status.apply(
  (s) => s.loadBalancer.ingress[0].ip
);
export const kubeconfig = config;
export const databaseName = database.name;
export const clusterName = clusterNameOutput;
