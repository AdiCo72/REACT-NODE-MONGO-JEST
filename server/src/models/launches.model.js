const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAUL_FLIGHT_NUMBER = 100;

//const launches = new Map();
//let latestFlightNumber = 100;

const launch = {
  flightNumber: 100,
  mission: "Keppler Exploration Flight",
  rocket: "Explore IS1",
  launchDate: new Date("2023-01-01"),
  target: "Kepler-442 b",
  customer: ["NASA"],
  upcoming: true,
  success: true,
};

SaveLaunch(launch);

//launches.set(launch.flightNumber, launch);

async function existsLaunchWithId(launchId) {
  return await launchesDatabase.findOne({
    flightNumber: launchId,
  })
}

async function getLatestFlightNumber(){
  const latestLaunch = await launchesDatabase
    .findOne()
    .sort('-flightNumber');
  if(!latestLaunch){
    return DEFAUL_FLIGHT_NUMBER;
  } 
  return latestLaunch.flightNumber;
}

async function getAllLaunches() {
  return await launchesDatabase.find({},
    {
      _id: 0,
      __v: 0,
    });
}

//mongodb save
async function SaveLaunch(launch) {
  const planet= await planets.findOne({
    keplerName: launch.target,
  })

  if(!planet){
    throw new Error('No matching planet');
  }

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
    const newFlightNumber = await getLatestFlightNumber() +1;
    const newLaunch = Object.assign(launch, { 
      flightNumber: newFlightNumber,
      customer: ["NASA"],
      upcoming: true,
      success: true,
    })
    await SaveLaunch(newLaunch);  
  }

// function addNewLaunch(launch) {
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       flightNumber: latestFlightNumber,
//       customer: ["NASA"],
//       upcoming: true,
//       success: true,
//     })
//   );
// }

async function abortLaunchById(launchId) {
  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;

  const aborted = await launchesDatabase.updateOne({
    flightNumber: launchId,
  }, {
    upcoming: false,
    success: false,
  });
  return aborted.modifiedCount===1;
}

module.exports = {
  getAllLaunches,
  addNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
};
