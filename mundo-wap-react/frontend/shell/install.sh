#!/usr/bin/env bash

./exec.sh stop

if [[ " $@ " =~ " -rm " ]]; then
  sudo rm -rf ./node_modules/
fi

docker compose build --force-rm

./exec.sh yarn install

./exec.sh stop
