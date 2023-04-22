const express = require('express');
const State = require('../model/States');
const fs = require('fs');
const path = require('path');
const statesData = require('../model/statesData.json');
const verifyStateCode = require('../middleware/verifyStateCode');

const getAllStates = async (req, res) => {
  try {
    let states = statesData;

    if (req.query.contig === 'true') {
      states = states.filter(state => state.code !== 'AK' && state.code !== 'HI');
    } else if (req.query.contig === 'false') {
      states = states.filter(state => state.code === 'AK' || state.code === 'HI');
    }

    const stateCodes = states.map(state => state.code);

    const dbStates = await State.find({ code: { $in: stateCodes } });

    const mergedStates = states.map(state => {
      const dbState = dbStates.find(s => s.code === state.code);
      if (dbState) {
        return { ...state, funfacts: dbState.funfacts };
      }
      return state;
    });

    return res.json(mergedStates);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



const getStateData = async (req, res) => {
  try {
    // Attach state code to request object using the middleware function
    const stateCode = req.stateCode;

    // Find the state with the given code in MongoDB
    const state = await State.findOne({ code: stateCode });

    // If state is not found in MongoDB, return a 404 response
    if (!state) {
      return res.status(404).json({ error: 'State not found' });
    }

    // Find the state with the given code in statesData.json
    const stateData = statesData.find(s => s.code === stateCode);

    // Combine the state data with the fun facts
    const stateInfo = {
      ...stateData,
      funfacts: state.funfacts,
    };

    // Return the state data with the fun facts
    return res.json(stateInfo);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};





///states/:state/funfact A random fun fact for the state URL parameter
const getFunFact = async (req, res) => {
  const stateCode = req.params.state;

  try {
    const state = await State.findOne({ code: stateCode });

    if (!state) {
      return res.status(404).json({ error: 'State not found' });
    }

    return res.json({ funfacts: state.funfacts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};





const getCapital = (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = statesData.find(s => s.code === stateCode);

  if (!state) {
    return res.status(404).json({ message: 'State not found' });
  }

  const capital = state.capital_city;
  const stateName = state.state;

  return res.status(200).json({ state: stateName, capital: capital });
};

const getNickname = async (req, res) => {
  const stateCode = req.params.state.toUpperCase();

  try {
    const state = statesData.find((state) => state.code === stateCode);

    if (!state) {
      return res.status(404).json({ message: "'Invalid state abbreviation parameter" });
    }

    const nickname = state.nickname;

    if (!nickname) {
      return res.status(404).json({ message: "Nickname not found for state" });
    }

    return res.json({ state: stateCode, nickname });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPopulation = (req, res) => {
  try {
    const stateCode = req.params.state;
    const state = statesData.find(s => s.code === stateCode.toUpperCase());

    if (!state) {
      return res.status(404).json({ error: `State with code ${stateCode} not found` });
    }

    const population = state.population;
    const stateName = state.state;

    return res.json({ state: stateName, population: population });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getAdmission = (req, res) => {
  try {
    const stateCode = req.params.state;
    const state = statesData.find(s => s.code === stateCode.toUpperCase());

    if (!state) {
      return res.status(404).json({ error: `State with code ${stateCode} not found` });
    }

    const stateName = state.state;
    const admitted = state.admission_date;

    return res.json({ state: stateName, admitted: admitted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

///states/:state/funfact

const postFunFact = async (req, res) => {
  try {
    const { state } = req.params;
    const { funfacts } = req.body;

    if (!funfacts) {
      return res.status(400).json({ error: 'State fun facts value required' });
    }

    if (!Array.isArray(funfacts)) {
      return res.status(400).json({ error: 'State fun facts value must be an array' });
    }

    const stateData = statesData.find(s => s.code === state.toUpperCase());

    if (!stateData) {
      return res.status(404).json({ error: 'State not found' });
    }

    let stateDoc = await State.findOne({ code: stateData.code });

    if (!stateDoc) {
      const newState = new State({ code: stateData.code, funfacts });
      await newState.save();
      return res.json(newState.funfacts);
    }

    const existingFunfacts = stateDoc.funfacts;
    const newFunfacts = funfacts.filter(f => !existingFunfacts.includes(f));

    if (newFunfacts.length === 0) {
      return res.json(stateDoc.funfacts);
    }

    stateDoc.funfacts.push(...newFunfacts);
    stateDoc = await stateDoc.save();
    res.json(stateDoc.funfacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};


const updateFunFacts = async (req, res) => {
  const stateCode = req.params.state;
  const index = req.body.index;
  const newFunFact = req.body.funfact;

  try {
    // Find the state by stateCode in the JSON file
    const stateInJson = statesData.find(state => state.code === stateCode);

    if (!stateInJson) {
      // If state is not found in the JSON file, return 404 status code with error message
      return res.status(404).json({ error: `State ${stateCode} not found` });
    }

    // Find the state by stateCode in the database
    const stateInDb = await State.findOne({ stateCode });

    if (!stateInDb) {
      // If state is not found in the database, create a new state document
      const newState = new State({
        code: stateCode,
        funfacts: [newFunFact]
      });

      // Save the new state document to the database
      const savedState = await newState.save();

      // Return the newly created state object
      return res.json(savedState);
    }

    // Check if index is sent and adjust for zero-based indexing
    if (!index) {
      return res.status(400).json({ error: 'Index parameter is required' });
    }
    const adjustedIndex = index - 1;

    // Check if index is valid
    if (adjustedIndex < 0 || adjustedIndex >= stateInDb.funfacts.length) {
      return res.status(400).json({ error: 'Invalid index parameter' });
    }

    // Update the funfact at the specified index
    stateInDb.funfacts[adjustedIndex] = newFunFact;

    // Save the updated state
    const updatedState = await stateInDb.save();

    // Return the updated state object
    return res.json(updatedState);

  } catch (error) {
    // If any error occurs, return 500 status code with error message
    return res.status(500).json({ error: error.message });
  }
};



const deleteFunFact = async (req, res) => {
  const { state } = req.params;
  const { index } = req.body;

  try {
    // Find the state by stateCode in the JSON file
      const stateInJson = statesData.find(stateData => stateData.code === state);


    if (!stateInJson) {
      // If state is not found in the JSON file, return 404 status code with error message
      return res.status(404).json({ error: `State ${state} not found` });
    }

    // Find the state by stateCode in the database
    const stateInDb = await State.findOne({ code: state });

    if (!stateInDb) {
      // If state is not found in the database, return 404 status code with error message
      return res.status(404).json({ error: `State ${state} not found in database` });
    }

    // Check if the index is valid
    if (!index || index <= 0 || index > stateInDb.funfacts.length) {
      return res.status(400).json({ error: "Invalid index" });
    }

    // Remove the funfact at the specified index
    stateInDb.funfacts.splice(index - 1, 1);

    // Save the updated state
    const updatedState = await stateInDb.save();

    // Return the updated state object
    return res.json(updatedState);

  } catch (error) {
    // If any error occurs, return 500 status code with error message
    return res.status(500).json({ error: error.message });
  }
};









module.exports = { getAllStates, getStateData, getFunFact, getCapital, getNickname, getPopulation, getAdmission, 
    postFunFact, updateFunFacts, deleteFunFact };