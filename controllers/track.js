module.exports = {
  index(req, res) {
    res.send(`The track:index controller for ${req.params.mission_id}`);
  }
};
