const statesData = require('../model/statesData.json');

const verifyStateCode = (req, res, next) => {
  const stateCode = req.params.state.toUpperCase();
  const stateCodes = statesData.map(state => state.code);

  if (stateCodes.includes(stateCode)) {
    req.stateCode = stateCode;
    return next();
  } else {
    return res.status(400).json({ error: 'Invalid state abbreviation parameter' });
  }
};

module.exports = verifyStateCode;
