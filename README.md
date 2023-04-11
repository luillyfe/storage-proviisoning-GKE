# Storage provisioning with Cloud SQL using Workload Identity

Having the need for a production ready GKE cluster? Need not to worry, this solution makes you ready to go in a matter of seconds. 

## Installation

we will be using [Pulumi](https://www.pulumi.com/docs/reference/cli/pulumi_up/) in order to provisioning our Cloud Infrastructure.

```bash
pulumi up
```

## Preview

```typescript
Type                                  Name                          Plan       
 +   pulumi:pulumi:Stack                   persistent-volumes-GKE-dev    create     
 +   ├─ gcp:serviceAccount:Account         gke-workload                  create     
 +   ├─ gcp:sql:DatabaseInstance           instance                      create     
 +   ├─ gcp:projects:IAMBinding            gsa-ksa-cloudsql              create     
 +   ├─ gcp:sql:Database                   database                      create     
 +   ├─ gcp:sql:User                       gke-user                      create     
 +   ├─ gcp:container:Cluster              gke-dynamic-provisioning      create     
 +   ├─ pulumi:providers:kubernetes        gke-dynamic-provisioning      create     
 +   ├─ kubernetes:core/v1:Namespace       gke-dynamic-provisioning      create     
 +   ├─ kubernetes:core/v1:ServiceAccount  workload                      create     
 +   ├─ gcp:serviceAccount:IAMBinding      gke-workload:[object Object]  create     
 +   ├─ kubernetes:apps/v1:Deployment      gke-dynamic-provisioning      create     
 +   └─ kubernetes:core/v1:Service         gke-dynamic-provisioning      create
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
