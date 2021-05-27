const onError = (err, req, res) => {
  console.log('there\'s an error in the user index.js route', err);
  /**
   * if no error is caught above,
   * then pass below, which then goes
   * to the root app.js error-handler
   * app-level middleware
   */
  if (err.name === "ForbiddenError") {
    return res.status(403).json({
      success: false,
      message: "Access denied.",
      ...err,
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      message: "You must be logged in",
      ...err,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json(err);
  }

  if (err.name === "BadRequest") {
    return res.status(400).json(err)
  };
};

export default onError;