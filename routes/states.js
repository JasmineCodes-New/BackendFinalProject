const express = require('express');
const router = express.Router();
const stateController = require('../controller/statesController');

router.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.originalUrl}`);
  next();
});

router.get('/', stateController.getAllStates);

router.get('/states/', stateController.getAllStates);

router.get('/states/:state', verifyStateCode, stateController.getStateData);

router.get('/states/:state/funfact', stateController.getFunFact);

router.get('/states/:state/capital', stateController.getCapital);

router.get('/states/:state/nickname', stateController.getNickname);

router.get('/states/:state/population', stateController.getPopulation);

router.get('/states/:state/admission', stateController.getAdmission);

router.post('/states/:state/funfact', stateController.postFunFact);

router.patch('/states/:state/funfact', stateController.updateFunFacts); 

router.delete('/states/:state/funfact', stateController.deleteFunFact);

module.exports = router;
