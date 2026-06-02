module.exports = {
  apps: [
    {
      name: 'titan-api',
      cwd: '/var/www/titan360/backend',
      script: '/var/www/titan360/backend/venv/bin/uvicorn',
      args: 'server:app --host 0.0.0.0 --port 8000',
      interpreter: 'none',
      env: {
        MONGO_URL: 'mongodb://localhost:27017',
        DB_NAME: 'titan360'
      }
    },
    {
      name: 'titan-admin',
      cwd: '/var/www/titan360/frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      interpreter: 'none'
    }
  ]
}
