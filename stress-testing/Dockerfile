# Use a base image with required libraries
FROM debian:bullseye-slim

# Install siege
RUN apt-get update && \
    apt-get install -y siege && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY siege.conf /root/.siege/siege.conf

# Set the default command to run Siege
ENTRYPOINT ["siege"]

