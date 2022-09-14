const API_URL= 'http://localhost:8000'

async function httpGetPlanets() {
  // Load planets and return as JSON.
  const response = await fetch(`${API_URL}/planets`);
  return await response.json();
}

async function httpGetLaunches() {
  // TODO: Once API is ready.
  // Load launches, sort by flight number, and return as JSON.
  const response = await fetch(`${API_URL}/launches`);
  const fetchedLauncehs=  await response.json();
  return fetchedLauncehs.sort( (a,b) => (a.flightnumber-b.flightnumber));
}

async function httpSubmitLaunch(launch) {
  // TODO: Once API is ready.
  // Submit given launch data to launch system.
  try {
    return await fetch(`${API_URL}/launches`, {
      method : "post",
      headers:{
        "Content-Type" : "application/json",
      },
      body: JSON.stringify(launch),
    });
  } catch (err){
    return {
      ok: false
    };
  }

}

async function httpAbortLaunch(id) {
  // TODO: Once API is ready.
  // Delete launch with given ID.

  try{
    return await fetch(`${API_URL}/launches/${id}`, {
      method : "delete",
    });
  } catch (err){
    return {
      ok: false
    };
  }

  
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
