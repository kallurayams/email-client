module.exports = {
  addProviderToQuery: (provider) => {
    return (req, res, next) => {
      if (!req.query) req.query = {};
      req.query.provider = provider;
      next();
    };
  },
};
