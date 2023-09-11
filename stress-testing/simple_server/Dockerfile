FROM python:3.9

WORKDIR /app

# Install netcat for our wait-for script
RUN apt-get update && apt-get install -y netcat-openbsd && apt-get clean


COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .

# Make our entrypoint script executable
RUN chmod +x wait-for-db.sh

# Set our custom script as the entrypoint
ENTRYPOINT ["./wait-for-db.sh"]

CMD ["flask", "run"]
