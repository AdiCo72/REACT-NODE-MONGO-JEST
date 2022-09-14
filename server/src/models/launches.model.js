const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const axios = require("axios");

const DEFAUL_FLIGHT_NUMBER = 100;

// const launch = {
//   flightNumber: 100, //flight_number
//   mission: "Keppler Exploration Flight", //name
//   rocket: "Explore IS1", //rocket.name in spacex
//   launchDate: new Date("2023-01-01"), //date_local
//   target: "Kepler-442 b", // NA
//   customer: ["NASA"], //payload.customers
//   upcoming: true,
//   success: true,
// };

// SaveLaunch(launch);

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';


async function populateLaunches(){
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select:{
            name: 1
          }
        },
        {
          path: 'payloads',
          seelct: {
            'customers': 1
          }
        }
      ]
    }
  });

  if(response.status !== 200){
    throw new Error('no response spacex download');
  }

  const launchDocs = response.data.docs;
  for(const launchDoc of launchDocs){
    var payloads = launchDoc['payloads'];
    if(!payloads)
    {
      throw new Error('no payloads');
    }
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launch ={
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    };
    // console.log(launch);
    await SaveLaunch(launch);
  }
}

async function loadLaunchData(){
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if(firstLaunch){
    console.log('data already loaded');
  }else{
    populateLaunches();
  }
}

async function findLaunch(filter){
  return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAUL_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function getAllLaunches( skip, limit) {
  return await launchesDatabase.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  )
  .sort({flightNumber : 1})
  .skip(skip)
  .limit(limit);
}

//mongodb save
async function SaveLaunch(launch) {
await launchesDatabase.updateOne(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function addNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error("No matching planet");
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    customer: ["NASA"],
    upcoming: true,
    success: true,
  });
  await SaveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchData,
  getAllLaunches,
  addNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
};
