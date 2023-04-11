import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export const inputName = "gke-dynamic-provisioning";
const projectId = gcp.config.project || "";

// Create a GKE cluster
const engineVersion = gcp.container
  .getEngineVersions()
  .then((v) => v.latestMasterVersion);

const cluster = new gcp.container.Cluster(inputName, {
  initialNodeCount: 3,
  minMasterVersion: engineVersion,
  nodeVersion: engineVersion,
  nodeConfig: {
    preemptible: true,
    machineType: "n1-standard-2",
    oauthScopes: [
      "https://www.googleapis.com/auth/compute",
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      // To use Secret Manager with workloads running on Compute Engine or Google Kubernetes Engine,
      // the underlying instance or node must have the cloud-platform OAuth scope
      "https://www.googleapis.com/auth/cloud-platform",
    ],
  },
  ipAllocationPolicy: {
    clusterIpv4CidrBlock: "",
    servicesIpv4CidrBlock: "",
  },
  networkingMode: "VPC_NATIVE",
  workloadIdentityConfig: {
    workloadPool: `${projectId}.svc.id.goog`,
  },
});

// Export the Cluster name
export const clusterNameOutput = cluster.name;

// Manufacture a GKE-style kubeconfig. Note that this is slightly "different"
// because of the way GKE requires gcloud to be in the picture for cluster
// authentication (rather than using the client cert/key directly).
export const kubeconfig = pulumi
  .all([cluster.name, cluster.endpoint, cluster.masterAuth])
  .apply(([name, endpoint, masterAuth]) => {
    const context = `${gcp.config.project}_${gcp.config.zone}_${name}`;
    return `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${masterAuth.clusterCaCertificate}
    server: https://${endpoint}
  name: ${context}
contexts:
- context:
    cluster: ${context}
    user: ${context}
  name: ${context}
current-context: ${context}
kind: Config
preferences: {}
users:
- name: ${context}
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1beta1
      command: gke-gcloud-auth-plugin
      installHint: Install gke-gcloud-auth-plugin for use with kubectl by following
        https://cloud.google.com/blog/products/containers-kubernetes/kubectl-auth-changes-in-gke
      provideClusterInfo: true
`;
  });

// Create a Kubernetes provider instance that uses our cluster from above.
export const clusterProvider = new k8s.Provider(inputName, {
  kubeconfig: kubeconfig,
});
