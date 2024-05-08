# Velocistack
![image](https://user-images.githubusercontent.com/16829864/191647658-5379ea3d-476d-4959-87ee-e8ad0107115e.png)

## Introduction
### What is Velocistack?
Velocistack is a free and open solution for streamlined host-based forensics and investigation.

- Collect forensic artifacts
- Post-process collections
- Visualize collections or hunt results
- Create cases for investigation
- Enrich results with additional context

### Why was Velocistack created?

To allow individuals to quickly spin up a local, integrated environment for analysis and investigation of forensic artifacts collected by Velociraptor, using popular free and open tools.

### Who should use Velocistack?

- Analysts
- Incident Responders
- Students
- Anyone!

## Screenshots
### Landing Page
![image](https://user-images.githubusercontent.com/16829864/190757428-51012a52-13d5-429e-837f-3215a64598a8.png)

### CyberChef
![image](https://user-images.githubusercontent.com/16829864/191644980-52b65fa7-6940-40fa-8d3d-966602aa66f1.png)

![image](https://user-images.githubusercontent.com/16829864/191645908-ed16ee29-1604-4cb9-9eba-72d1fd544fbd.png)

### Grafana
![image](https://user-images.githubusercontent.com/16829864/191645061-e0bd7597-5d2a-4bb5-b26c-6ec3bd5c41e1.png)

### IntelOwl
![image](https://user-images.githubusercontent.com/16829864/191645176-08ddbe91-b82e-439b-80a4-babc132cc588.png)

### IRIS
![image](https://user-images.githubusercontent.com/16829864/191645234-762f709d-1a6e-4c77-967f-175d71cef830.png)

### Kibana
![image](https://user-images.githubusercontent.com/16829864/191645828-0a29ae0b-209b-48fc-a949-75e108c50b5c.png)


## Getting started
### Pre-reqs
- Tested on Ubuntu 20.04, although 18.04 should work as well (or other distros)
- Docker should be installed.
- The Docker Compose plugin should be installed: https://docs.docker.com/compose/install/

### Clone
```
git clone https://github.com/weslambert/velocistack && cd velocistack
```

### Run the installer script
`sudo ./install_velocistack`

NOTE: It may take 10-15 minutes or more for all services to be online, depending on your network bandwidth and system resources.

### Authentication
Currently, authentication occurs primarily through Velociraptor. It proxies all services, except for IRIS and IntelOwl

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

Issues with specific services can potentially be identified using `docker logs $container_name`.
