resource "ns1_pulsarjob" "example_javascript" {
  name    = "ddc.cere.network"
  app_id = ns1_pulsar_application.latency_glass.id
  type_id  = "latency"

  config = {
    host = "terraform.job_host.io"
    url_path = "/terraform.job_url_path.io"
  }
}
