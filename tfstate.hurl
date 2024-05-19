# Get the health of the service
GET http://localhost:8787/health

HTTP 200

# Get the hurl state, should be empty
GET http://localhost:8787/states/hurl
Authorization: Basic dGVycmFmb3JtOnBhc3N3b3Jk

HTTP 200

# Create a new hurl state
POST http://localhost:8787/states/hurl
Authorization: Basic dGVycmFmb3JtOnBhc3N3b3Jk
Content-Type: application/json

{
  "name": "hurl",
  "value": "hello"
}

HTTP 204

# Get the hurl state, should be same as created
GET http://localhost:8787/states/hurl
Authorization: Basic dGVycmFmb3JtOnBhc3N3b3Jk

HTTP 200

{
  "name": "hurl",
  "value": "hello"
}

# Lock the hurl state
LOCK http://localhost:8787/states/hurl/lock
Authorization: Basic dGVycmFmb3JtOnBhc3N3b3Jk

HTTP 200