const outlookProvider = require("./outlook");

function createProvider(provider) {
  const providers = {
    outlook: outlookProvider,
  };

  return providers[provider] || null;
}

module.exports = createProvider;
