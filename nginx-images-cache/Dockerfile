# Use the official Nginx image as a base
ARG NGINX_VERSION=1.25.2

FROM nginx:$NGINX_VERSION

# Set working directory
WORKDIR /tmp

# Install necessary packages
RUN apt-get update && \
    apt-get install -y wget unzip gcc libpcre3-dev zlib1g-dev make git

# Download ngx_cache_purge module
RUN git clone https://github.com/Danrancan/ngx_cache_purge_dynamic.git

# Download and compile nginx with the module
RUN wget http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz && \
    tar -xzvf nginx-$NGINX_VERSION.tar.gz && \
    cd nginx-$NGINX_VERSION && \
    ./configure --with-compat --add-dynamic-module=../ngx_cache_purge_dynamic && \
    make modules



# Move the module to the nginx modules directory
RUN cp nginx-$NGINX_VERSION/objs/ngx_http_cache_purge_module.so /etc/nginx/modules/

# Remove unnecessary files
#RUN rm -rf /tmp/*

# Load the module in nginx
RUN echo 'load_module modules/ngx_http_cache_purge_module.so;' > /etc/nginx/conf.d/load_mod_cache_purge.conf

COPY nginx.conf /etc/nginx/nginx.conf

# Expose ports
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]