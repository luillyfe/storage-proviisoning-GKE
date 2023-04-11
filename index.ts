import { kubeconfig as config, clusterNameOutput } from "./providerCFG";

// Export the Service name and public LoadBalancer endpoint
export const kubeconfig = config;
export const clusterName = clusterNameOutput;
