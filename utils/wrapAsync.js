module.exports = (fn) => {
    return (req, res, next) => {
      // Ensure async errors are passed to next() with .catch
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };