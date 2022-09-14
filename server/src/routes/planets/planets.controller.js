const { getPlanets } = require("../../models/planets.model.js");

async function httpGetAllPlanets(req, res) {
  return res.status(200).json(await getPlanets());
}

module.exports = { httpGetAllPlanets };
