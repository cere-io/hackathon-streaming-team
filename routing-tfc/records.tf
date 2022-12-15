resource "ns1_zone" "devnet_ddc_zone" {
  zone = "devnet.ddc.cere.network"
  ttl  = 600
}

resource "ns1_zone" "testnet_ddc_zone" {
  zone = "testnet.ddc.cere.network"
  ttl  = 600
}

resource "ns1_zone" "mainnet_ddc_zone" {
  zone = "mainnet.ddc.cere.network"
  ttl  = 600
}
