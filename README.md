# Je m'inspire Web App

A full-stack project with **Laravel** backend and **React + TypeScript** frontend.

---

##  Requirements

- PHP 8.4.12 
- Composer 2.8.11
- Node.js v22.19.0
- npm 11.5.2
- laravel 5.14.0
- larargon full 6.0
- Git version 2.47.1.windows.2

##  Project Structure

my-project/
├─ backend/ # Laravel backend
├─ frontend/ # React + TypeScript frontend
└─ .github/ # CI/CD workflows
##  Environment Setup


```bash
git clone [https://github.com/FRWD789/je-m-inspire.git](https://github.com/FRWD789/je-m-inspire.git)
cd je-m-inspire
nvm use
cd frontend
npm ci
npm run dev
#in new terminal
cd ../backend
copy .env.example .env 
composer install
php artisan key:generate

"CREATE DATABASE backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; in largon
php artisan migrate
php artisan serve
```
# Workflow & Branching Strategy

### 1. Branch Types

| Branch Type       | Purpose                                  |
|------------------|------------------------------------------|
| `main`           | Always stable, production-ready code     |
| `feature/<name>` | New features or improvements            |
| `hotfix/<name>`  | Quick fixes for production               |


