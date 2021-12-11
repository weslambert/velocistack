# velocistack

## Getting started
### Pre-reqs
- Tested on Ubuntu 20.04, although 18.04 should work as well (or other distros)
- Docker and docker-compose should be installed.

### Clone and Build
```
git clone https://github.com/weslambert/velocistack && cd velocistack
sudo docker-compose up -d
```

### Authentication
Currently, authentication occurs through Velociraptor. It proxies all other services.

`User: admin`

`Password: admin`

### Web Access
#### Velociraptor
`https://$YOURIP:8889`

#### Cyberchef
`https://$YOURIP:8889/cyberchef`

#### Grafana
`https://$YOURIP:8889/grafana`

#### Prometheus
`https://$YOURIP:8889/prometheus`

#### Kibana
`https://$YOURIP:8889/kibana`


