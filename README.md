# velocistack

## Getting started
### Pre-reqs
- Tested on Ubuntu 20.04, although 18.04 should work as well (or other distros)
- Docker and docker-compose should be installed.

### Clone
```
git clone https://github.com/weslambert/velocistack && cd velocistack
```

### Run with Elastic Stack
`docker-compose --profile elastic up -d`

OR

### Run with Zinc (Experimental)
`docker-compose --profile zinc up -d`


### Authentication
Currently, authentication occurs through Velociraptor. It proxies all other services, except for Zinc (if enabled).

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

#### Zinc (if enabled)
`https://$YOURIP/zinc`


