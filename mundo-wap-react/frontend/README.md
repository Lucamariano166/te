# Mundo Wap React Test Application

## Requirements
It is highly recommended to use Linux because the project has several bash scripts for easy installation and usage. However, you can also refer to `.sh` files in the `shell` folder to copy and paste  `docker compose` commands manually.

This project uses `docker compose`, so if you haven't installed it yet, you can do so by following the official documentation [here](https://docs.docker.com/desktop/install/linux-install/).

Make sure the port 3000, defined in `docker-compose.yml`, is available.

## Installation
To make this easier, all the commands necessary to install, run and access the application can be done through the `exec.sh` file in the project root.

Follow the steps bellow:

1. Give execution permissions to executable files:
   ```bash
   sudo chmod -R +x exec.sh shell
   ```
2. Build the docker image and install the application dependencies with the below command:
   ```bash
   ./exec.sh install
   ```

## Usage
1. Execute the below command to start the application:
   ```bash
   ./exec.sh start
   ```
   After installed and started, the application should be accessible at [3000](http://localhost:3000) port.
2. Execute the following command to watch the application logs:
   ```bash
   ./exec.sh logs
   ```
3. Execute the below command to stop the application:
   ```bash
   ./exec.sh stop
   ```
4. You may need to run commands inside the application container, such as to install yarn packages. You can do this by running the command below:
   ```bash
   ./exec.sh [your command]
   ```
   For example:
   ```bash
   ./exec.sh yarn add styled-components
   ```

## Important instructions
Skills with containers and environment management are not the focus of this test, so in case of any issues creating, starting or executing the environment, please contact us.

Click [here](https://docs.google.com/document/d/1XbEMZhUMrU51QjgQXRnXvWqlbpp-XGnO4K84dzKSQEI/edit?usp=sharing) to see the test specifications, requirements and instructions.
