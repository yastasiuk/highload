#!/bin/sh

while ! nc -z db 3306; do
    echo "Waiting for MySQL..."
    sleep 1
done

exec "$@"
