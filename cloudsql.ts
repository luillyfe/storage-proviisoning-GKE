import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// See versions at https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/sql_database_instance#database_version
export const instance = new gcp.sql.DatabaseInstance("instance", {
  databaseVersion: "MYSQL_8_0",
  settings: {
    tier: "db-f1-micro",
  },
  deletionProtection: false,
});

const cfg = new pulumi.Config();
new gcp.sql.User("gke-user", {
  host: "%",
  instance: instance.name,
  password: cfg.requireSecret("mysqlPassword"),
});

export const database = new gcp.sql.Database("database", {
  instance: instance.name,
});
