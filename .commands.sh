// anotate service accounts

kubectl annotate serviceaccount ksaName -n cluster-namespace \
    iam.gke.io/gcp-service-account=fully-quallified-service-account-name