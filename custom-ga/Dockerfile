FROM node:18

# Install cron
RUN apt-get update && apt-get install -y cron

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

COPY . .



# Add the crontab file
COPY exchange_rates_cronjob /etc/cron.d/exchange_rates_cronjob
RUN chmod 0644 /etc/cron.d/exchange_rates_cronjob

# Create a log file
RUN touch /var/log/cron.log

# Run the command on container startup
CMD cron && tail -f /var/log/cron.log

