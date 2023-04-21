const statesData = require('../model/statesData.json');

const verifyStateCode = (req, res, next) => {
  const stateCode = req.params.state;

  if (!stateCode) {
    return res.status(400).json({ error: 'State abbreviation parameter is missing' });
  }

  const validCodes = statesData.map(state => state.code.toUpperCase());

  if (!validCodes.includes(stateCode.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid state abbreviation parameter' });
  }

  req.stateCode = stateCode.toUpperCase();
  next();
};

module.exports = verifyStateCode;

