resource "ns1_application" "latency_glass" {
  name = "terraform_app"
  active = true
  browser_wait_millis = 100
  jobs_per_transaction = 100
}
