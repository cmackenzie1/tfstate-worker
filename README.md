# `tfstate-worker` ⛏

[![Test](https://github.com/cmackenzie1/tfstate-worker/actions/workflows/test.yaml/badge.svg?branch=main)](https://github.com/cmackenzie1/tfstate-worker/actions/workflows/test.yaml)

A Terraform state backend using the [`http`](https://www.terraform.io/language/settings/backends/http), backed by
Cloudflare Workers and R2, so it is cheap to run. Oh, and it supports locking 🔒.

The original code was moved from [`cmackenzie1/holster`](https://github.com/cmackenzie1/holster) to its own repository.
You can read about the original
implementation [here](https://mirio.dev/2022/09/18/implementing-a-terraform-state-backend/).

> [!WARNING]
> This Worker is exposed to the public internet, it is _YOUR_ responsibility to secure it. The HTTP backend for
> terraform supports basic auth and/or mTLS, so pick one (or both) and use it!

## Getting Started

1. Click the "Use this template" button to create a new repository from this template.
2. Create an R2 bucket in your Cloudflare account, or use an existing one.
3. Update `wrangler.toml` with your Cloudflare account ID and custom domain and bucket name.
4. If using basic auth, add your credentials to your worker using `wrangler secret put TFSTATE_USERNAME`
   and `wrangler secret put TFSTATE_PASSWORD`.
5. If using mTLS, configure your Worker
   to [require a client certificate](https://developers.cloudflare.com/ssl/client-certificates/enable-mtls/#enable-mtls).
6. Run `wrangler publish` to deploy the Worker to your Cloudflare account.
7. Update your Terraform configuration to use the new backend and run `terraform init`.
8. Profit! 🚀

```hcl
terraform {
  backend "http" {
    address        = "https://tfstate.example.com/tfstate/states/your-project-name"
    lock_address   = "https://tfstate.example.com/tfstate/states/your-project-name/lock"
    lock_method = "LOCK" # can also be "PUT"
    unlock_address = "https://tfstate.example.com/tfstate/states/your-project-name/lock"
    unlock_method  = "UNLOCK" # can also be "DELETE"

    # If using basic auth
    username = "<YOUR_USERNAME>"
    password = "<YOUR_PASSWORD>"

    # If using mTLS
    client_certificate_pem    = "<path-to-ca-cert>"
    client_private_key_pem    = "<path-to-client-cert>"
    client_ca_certificate_pem = "<path-to-client-key>"
  }
}
```

## FAQ

### Why use this?

Sometimes the default backends don't cut it. For me, I wanted a backend that supported locking that used Cloudflare R2
for storage.

### Why didn't you use the S3 backend w/ custom endpoint?

The existing S3 backend doesn't support locking without DynamoDB, which is an additional cost. This Worker is a cheaper
alternative, and it's fun to build things!

### How much does this cost?

Cloudflare Workers and R2 are billed based on usage, with a very generous free tier. You can check the pricing for
Workers [here](https://developers.cloudflare.com/workers/platform/pricing) and
R2 [here](https://developers.cloudflare.com/r2/pricing/). Overall, this can be done for very cheap, or even
free :)

## Troubleshooting

Got yourself in a tfstate*tastrophy*? The following commands may help.

**NOTE: These can be destructive, so be careful!**

### My state is locked, how can I unlock it?

```curl
# Get current lock info
curl https://tfstate.example.com/tfstate/states/your-project-name/lock

# Manually remove the lock
curl -X DELETE https://tfstate.example.com/tfstate/states/your-project-name/lock

# or using `terraform`
terraform force-unlock <LOCK_ID>
```

### I get a 400 Error when attempting to lock

Double check you are using UPPER case values for `lock_method` and `unlock_method`.
