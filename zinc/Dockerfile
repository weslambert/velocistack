FROM ubuntu:18.04
LABEL version="Zinc 0.1.1"
LABEL description="Zinc search server in a Docker container"
LABEL maintainer="Wes Lambert, @therealwlambert"
RUN apt-get update && \
    apt-get install -y wget && \
    # Get Zinc binary
    mkdir -p /opt/zinc && \
    wget -O /opt/zinc/zinc.tar.gz https://github.com/zinclabs/zinc/releases/download/v0.1.9/zinc_0.1.9_Linux_x86_64.tar.gz && \
    tar -xvf /opt/zinc/zinc.tar.gz -C /opt/zinc/ && \
    # Clean up
    rm -f /opt/zinc/zinc.tar.gz && \
    apt-get remove -y --purge wget && \
    apt-get clean
CMD ["/opt/zinc/zinc"]
