#!/usr/bin/env bash

function exec {
  FILE=./shell/"$1".sh

  if test -f "$FILE"; then
    source ./shell/"$1".sh ${*:2}
  elif [ "$1" = "help" ]; then
    echo -e 'List of available commands:\n'

    declare -a Messages=(
      "install \t Setup project \t\t [-rm] \t\t Remove node_modules folder before setup"
      "logs \t\t Watch logs"
      "start \t\t Start project \t\t [-l] \t\t Watch logs"
      "stop \t\t Stop project"
      "\nAny other command (like yarn) will be redirected to run within the \"app\" docker service"
    )
    for msg in "${Messages[@]}"; do
      printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' =
      echo -e "$msg"
    done
  else
    echo -e "Running \"$1\" inside \"app\" docker service\n"
    docker compose run --rm app "$@"
  fi
}

exec "$@" || echo -e '\nIf this is not the expected command, use "./exec.sh help" to list available commands'
