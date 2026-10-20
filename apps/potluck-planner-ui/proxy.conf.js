const target = {
  proxyUrl: process.env['BACKEND_URL'] || 'http://localhost:3000',
  changeOrigin: true,
};

const paths = {
  '/api/': '/api/',
};

module.exports = { target, paths };
