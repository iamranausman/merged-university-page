

export const getCountries = async () => {
  try {
    const response = await fetch('/api/frontend/countries', {
      method: "POST"
    });
    const countries = await response.json();

    return countries.countries.map(country => ({
      id: country.id,
      name: country.name
    }));
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};

export const getStats = async (countryID) => {
  try {
    const response = await fetch(`/api/frontend/states?countryId=${countryID}`, {
      method: "POST",
    });
    const states = await response.json();

    return states.states.map(state => ({
      id: state.id,
      name: state.name
    }));
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

export const getCities = async (stateID) => {
  
  try {
    const response = await fetch(`/api/frontend/cities?stateId=${stateID}`, {
      method: "POST"
    });
    const cities = await response.json();
    return cities.cities.map(city => ({
      id: city.id,
      name: city.name
    }));
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};