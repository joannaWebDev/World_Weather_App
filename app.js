// Go to this URL and register https://openweathermap.org/appid
// Get your API KEY (appid)

const APIkey = "416e0f0dd8c8e9042517b54f30bf565c";
const baseURL = "http://api.openweathermap.org/data/2.5/weather?";
const mapboxglAccessToken = "pk.eyJ1IjoiamNhbWlsbzcyMSIsImEiOiJja2dkbHlwdGQwa2VkMnhvN2ZtaDJwMWxiIn0.ML2cRs2To_8T_FKR1wRh7A";
let map;

// TAREA: centrar el mapa cuando haga click en el container del weather.
const createMarker = (longitude, latitude) => new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);

const createMap = (latitude, longitude) => {
  const mapDiv = document.getElementById("map");
  mapDiv.style.width = "700px";
  mapDiv.style.height = "700px";

  mapboxgl.accessToken = mapboxglAccessToken;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [longitude, latitude],
    zoom: 8
  });

  new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);

  return map;
};

const onSuccess = position => {
  const {
    coords: { latitude, longitude }
  } = position;
  map = createMap(latitude, longitude);
  createMarker(latitude, longitude, map);
  callWeather(latitude, longitude);
};

const onError = error => {
  console.error(error.message);
  const notification = document.createElement("p");
  notification.innerText = error.message;

  const divNotification = document.getElementsByClassName("notification")[0];
  divNotification.style.display = "block";

  divNotification.appendChild(notification);
};

const convertKelvinToCelsius = kelvin => Math.round(kelvin - 273.15);

const capitalizeFirstLetters = text => {
  const separetedWords = text.split(" ");
  const arrayResult = separetedWords.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  return arrayResult.join(" ");
};

const showWeatherInfo = city => {
  // TAREA: Don't Repeat Yourself. Encontrar la manera de que no sea necesario ShowWeatherInfo, sino que nos muestre
  // la información con el método addElementToList
  const {
    main: { temp },
    name,
    sys: { country },
    coord: { lat, lon },
    weather: [{ description, icon }]
  } = city;

  const iconElement = document.getElementById("icon");
  iconElement.src = `icons/${icon}.png`;

  const temperature = document.getElementById("temperature-value");
  temperature.innerText = `${convertKelvinToCelsius(temp)}°C`;

  const desc = document.getElementById("temperature-description");
  const capitalizedDescription = capitalizeFirstLetters(description);
  desc.innerText = capitalizedDescription;

  const place = document.getElementById("location");
  place.innerText = `${capitalizeFirstLetters(name)}, ${country}`;
};

const cleanHtmlCollection = collection => {
    for (let i = 0; i < collection.length; i++) {
    collection[i].parentNode.removeChild(collection[i])
    }
    //collection[i].remove();   
    /*if(  collection[i] )
    collection[i].remove();*/
    }


const searchResultsList = results => {
  // TAREA: borrar los elementos de la lista cada vez que se haga una nueva búsqueda
  const resultsList = document.getElementById("results");
  //cleanHtmlCollection(resultsList);
  const { list: citiesList } = results;

  citiesList.map(city => {
    const {
      main: { temp },
      name,
      coord: { lat: latitude, lon: longitude },
      sys: { country },
      weather: [{ description, icon }]
    } = city;

    const listItem = document.createElement("li");
    listItem.className = "list-item";
    listItem.innerHTML = `${name}, ${country}, ${description}, ${convertKelvinToCelsius(temp)}°C`;
    const img = document.createElement("img");
    img.className = "list-item-icon";
    img.src = `icons/${icon}.png`;
    listItem.appendChild(img);
    const addButton = document.createElement("button");
    addButton.innerHTML = "+ Add";
    addButton.onclick = () => {
      createMarker(longitude, latitude);
      addElementToList(city);
    };

    listItem.appendChild(addButton);

    resultsList.appendChild(listItem);
  });
};

const addElementToList = city => {
  const {
    id,
    main: { temp },
    name,
    sys: { country },
    weather: [{ description, icon }]
  } = city;

  const container = document.getElementById("container");
  const clone = container.cloneNode(true);
  clone.id = `container-${name}-${id}`;

  // aqui accedemos a los elementos del container
  const [titleDiv, notificationDiv, weatherContainerDiv] = clone.children;
  titleDiv.children[0].innerHTML = `${name} Weather`;

  // aqui accedemos a los elementos del weatherContainerDiv
  const [weatherIconDiv, temperatureValueDiv, temperatureDescriptionDiv, locationDiv] = weatherContainerDiv.children;

  weatherIconDiv.children[0].src = `icons/${icon}.png`;
  weatherIconDiv.children[0].id = `icon-${name}-${id}`;

  temperatureValueDiv.children[0].id = `temperature-value-${name}-${id}`;
  temperatureValueDiv.children[0].innerHTML = `${convertKelvinToCelsius(temp)}°C`;

  temperatureDescriptionDiv.children[0].id = `temperature-description-${name}-${id}`;
  temperatureDescriptionDiv.children[0].innerText = capitalizeFirstLetters(description);

  locationDiv.children[0].id= `location-${name}-${id}`;
  locationDiv.children[0].innerText = `${name}, ${country}`;


  console.log("addElementToList", city, titleDiv, notificationDiv, weatherContainerDiv);
  const list = document.getElementsByClassName("list")[0];
  list.appendChild(clone);
};

const callWeather = (latitude, longitude) => {
  const call = fetch(`${baseURL}lat=${latitude}&lon=${longitude}&appid=${APIkey}`);

  call.then(response => response.json()).then(weatherInfo => showWeatherInfo(weatherInfo));
  call.catch(error => console.error(error));
};

const searchCityWeather = cityName => {
  const call = fetch(`https://api.openweathermap.org/data/2.5/find?q=${cityName}&appid=${APIkey}`);

  call.then(response => response.json()).then(weatherSearchInfo => searchResultsList(weatherSearchInfo));
  call.catch(error => console.error(error));
};

const handleOnSearch = () => {
  const text = document.getElementById("searchInput").value;

  if (text) {
    searchCityWeather(text.toLowerCase());
  }
};

navigator.geolocation.getCurrentPosition(onSuccess, onError);
// fetch(URL).then(onSuccess()).catch(onError());
