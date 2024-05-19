terraform {
  backend "http" {
    address        = "http://localhost:8787/states/tfstate-example"
    lock_address   = "http://localhost:8787/states/tfstate-example/lock"
    lock_method    = "LOCK" # can also be "PUT"
    unlock_address = "http://localhost:8787/states/tfstate-example/lock"
    unlock_method  = "UNLOCK" # can also be "DELETE"
    username       = "terraform"
    password       = "password"
  }

  required_providers {
    http = {
      source  = "hashicorp/http"
      version = "3.0.1"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.3.2"
    }
  }
}

resource "random_pet" "server" {

}

output "pet" {
  value = random_pet.server.id
}

resource "random_password" "server" {
  length = 15
}

output "pwd" {
  value     = random_password.server.result
  sensitive = true
}
