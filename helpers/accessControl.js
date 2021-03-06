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
  },
  navBarSupport(user) {
    var ViewModel = {};
    if (user) {
      ViewModel.user = user;
      if (user.role === 'admin') {
        ViewModel.flightDirectorOrAdmin = true;
        ViewModel.isAdmin = true;
      }
      if (user.role === 'flightdirector') {
        ViewModel.flightDirectorOrAdmin = true;
      }
    }
    return ViewModel;
  }
};
