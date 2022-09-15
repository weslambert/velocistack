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
Currently, authentication occurs through Velociraptor. It proxies all other services, except for IRIS and IntelOwl

#### Velociraptor credentials:
`User: admin`

`Password: admin`

#### IRIS credentials:
`User: administrator`

`Password: admin`

#### IntelOwl credentials:
Create superuser credentials for IntelOwl by running the following command from the CLI:

`sudo docker exec -ti uwsgi python3 manage.py createsuperuser`


### Web Access
#### Velociraptor
`https://$YOURIP/velocistack`

#### Cyberchef
`https://$YOURIP/velocistack/cyberchef`

#### Grafana
`https://$YOURIP/velocistack/grafana`

#### IntelOwl
`https://$YOURIP:8443`

#### IRIS
`https://$YOURIP/`

#### Prometheus
`https://$YOURIP/velocistack/prometheus`

#### Kibana
`https://$YOURIP/velocistack/kibana`


### Troubleshooting
If you experience an error with `cadvisor` and `/var/lib/docker`, try replacing the volume with `/var/snap/docker/common/var-lib-docker/` (for Docker installs that have occurred via `snap`).
