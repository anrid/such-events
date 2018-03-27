#!/bin/bash
docker volume create --name orientdb-data-volume
docker volume create --name orientdb-backup-volume
docker volume create --name nats-volume
docker volume create --name mongo-volume
docker volume create --name es-volume
# docker volume create --name es-volume --opt device=:/tmp/docker/es-volume