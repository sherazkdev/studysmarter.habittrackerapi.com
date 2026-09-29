/**
 * PM2 ecosystem — VPS path: /var/www/study-smarter-api
 * App listens on 127.0.0.1:3021 (nginx reverse proxy).
 */
module.exports = {
  apps: [
    {
      name: "study-smarter-api",
      cwd: "/var/www/study-smarter-api",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3021",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production",
        PORT: "3021",
      },
    },
  ],
};
