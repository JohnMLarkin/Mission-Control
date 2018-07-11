module.exports = {
  onlyAdmin(req) {
    let allowed = false;
    if (req.user) {
      if (req.user.role === 'admin') {
        allowed = true;
      }
    }
    return allowed;
  },
  flightDirectorOrAdmin(req) {
    let allowed = false;
    if (req.user) {
      if ((req.user.role === 'flightdirector') || (req.user.role === 'admin')) {
        allowed = true;
      }
    }
    return allowed;
  }
};
