# Visit Pro

Aplicação fullstack com backend em CakePHP e frontend em React.

## Arquitetura

- **Backend**: CakePHP 5.2 (PHP 8.1+)
- **Frontend**: React com Vite e TypeScript
- **Banco de Dados**: MySQL 8.0
- **Containerização**: Docker + Docker Compose

## 🚀 Como rodar com Docker

### Pré-requisitos

- [Docker](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd visit-pro
```

### 2. Execute com Docker Compose

```bash
cd docker
docker-compose up -d
```

Este comando irá:
- Baixar e configurar o MySQL 8.0
- Construir e executar o backend CakePHP
- Construir e executar o frontend React
- Configurar a rede entre os containers

### 3. Acesse a aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **MySQL**: localhost:3306

## 📋 Serviços

### MySQL
- **Container**: `mysql_db`
- **Porta**: 3306
- **Database**: `cakephp_app`
- **Usuário**: `cakeuser`
- **Senha**: `cakepass`
- **Root Password**: `root`

### Backend (CakePHP)
- **Container**: `cakephp_backend`
- **Porta**: 8000
- **Volume**: `./backend` montado em `/var/www/html`

### Frontend (React)
- **Container**: `react_frontend`
- **Porta**: 3000
- **Volume**: `./front-end` montado em `/app`
- **API URL**: `http://localhost:8000`

## 🛠️ Comandos úteis

### Gerenciar containers
```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs dos serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Reconstruir containers
docker-compose up -d --build
```

### Executar comandos no backend
```bash
# Entrar no container do backend
docker-compose exec backend bash

# Executar migrations do CakePHP
docker-compose exec backend bin/cake migrations migrate

# Executar testes
docker-compose exec backend composer test
```

### Executar comandos no frontend
```bash
# Entrar no container do frontend
docker-compose exec frontend bash

# Instalar dependências (se necessário)
docker-compose exec frontend npm install

# Executar linting
docker-compose exec frontend npm run lint
```

### Banco de dados
```bash
# Conectar ao MySQL
docker-compose exec mysql mysql -u root -proot cakephp_app

# Fazer backup do banco
docker-compose exec mysql mysqldump -u root -proot cakephp_app > backup.sql

# Restaurar backup
docker-compose exec -T mysql mysql -u root -proot cakephp_app < backup.sql
```

## 🔧 Configuração

### Variáveis de ambiente

As seguintes variáveis são configuradas automaticamente:

**Backend:**
- `DB_HOST=mysql`
- `DB_NAME=cakephp_app`
- `DB_USER=cakeuser`
- `DB_PASSWORD=cakepass`

**Frontend:**
- `VITE_API_URL=http://localhost:8000`

### Volumes

- `mysql_data`: Persiste os dados do MySQL
- `./backend`: Código do backend (hot-reload)
- `./front-end`: Código do frontend (hot-reload)
- `/app/node_modules`: Cache das dependências do Node.js

## 🐛 Troubleshooting

### MySQL não está funcionando
```bash
# Verificar health check
docker-compose ps

# Ver logs do MySQL
docker-compose logs mysql

# Resetar volume do MySQL (⚠️ apaga dados)
docker-compose down
docker volume rm docker_mysql_data
docker-compose up -d
```

### Frontend não carrega
```bash
# Verificar se o backend está rodando
curl http://localhost:8000

# Reconstruir container do frontend
docker-compose up -d --build frontend
```

### Problemas de permissão
```bash
# Ajustar permissões (Linux/Mac)
sudo chown -R $USER:$USER backend front-end
```

## 📝 Desenvolvimento

Para desenvolvimento local, os volumes estão configurados para hot-reload:
- Mudanças no código PHP são refletidas automaticamente
- Mudanças no código React são refletidas automaticamente via Vite

## 🚪 Portas utilizadas

- `3000`: Frontend React
- `8000`: Backend CakePHP
- `3306`: MySQL

Certifique-se de que essas portas estão disponíveis antes de executar o projeto.