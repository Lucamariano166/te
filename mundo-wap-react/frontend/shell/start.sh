#!/usr/bin/env bash

./exec.sh stop

docker compose up -d

if [[ " $@ " =~ " -l " ]]; then
  ./exec.sh logs
fi
