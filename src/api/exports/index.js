const routes = require('./routes');
const Handler = require('./handler');

module.exports = {
  name: 'exports',
  register: async (server, { service, validator }) => {
    const handler = new Handler(service, validator);
    server.route(routes(handler));
  },
};
