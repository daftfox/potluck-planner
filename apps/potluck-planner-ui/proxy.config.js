const port = process.env.PLANNER_SERVER_PORT || 3000;
const PROXY_CONFIG = {
  '/api': {
    target: `http://localhost:${port}`,
    changeOrigin: true,
    secure: false,
  },
};

console.log('Proxy config:', PROXY_CONFIG);

module.exports = PROXY_CONFIG;