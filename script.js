var urlParams = new URLSearchParams(location.search);

if (urlParams.has('country')) {
  fetch(["https://corona.lmao.ninja/v2/historical/", urlParams.get('country')].join('')).then((response) => {
    return response.json()
  }).then(onLoaded);
  var countryName = urlParams.get('country')
  countryName = countryName.toLowerCase()
  countryName = countryName.replace(/^\w/, c => c.toUpperCase())
  document.getElementById("pagetitle").innerHTML += ["<br> in", countryName].join(" ")
} else
  fetch("https://corona.lmao.ninja/v2/historical/all").then((response) => {
    return response.json()
  }).then(onLoaded);

function perDay(inputArray) {
  k = Object.keys(inputArray)
  return inputArray[k[k.length - 1]] - inputArray[k[k.length - 2]]
}

function calcInterval(daily) {
  //milliseconds in a day divided by cases per day
  return 86400000 / daily
}

function updateValue(elemId) {
  elem = document.getElementById(elemId)
  elem.textContent++
  elem.textContent += " "
  elem.parentElement.classList.toggle("even");

  elem = document.getElementById(['l', elemId].join(''))
  elem.textContent++
  elem.textContent += " "
  elem.parentElement.classList.toggle("even");
}

function saveSession(lastDate) {
  if (window.localStorage.getItem('lastTime') === null) {
    window.localStorage.setItem('dateKey', lastDate)
    window.localStorage.setItem('lastTime', Date.now())
  }
}

function loadLastSession(data) {
  if (window.localStorage.getItem('lastTime') !== null) {
    dateKey = window.localStorage.getItem('dateKey')
    currentDate = Object.keys(data.cases)[Object.keys(data.cases).length - 1]
    oldTime = parseInt(window.localStorage.getItem('lastTime'))

    timeDiff = (Date.now() - oldTime) % 86400000
    var c = 0,
      d = 0,
      r = 0

    if ((Date.now() - oldTime) > 86400000) {
      c = data.cases[currentDate] - data.cases[dateKey]
      d = data.deaths[currentDate] - data.deaths[dateKey]
      r = data.recovered[currentDate] - data.recovered[dateKey]
    }
    c += Math.floor(timeDiff / calcInterval(perDay(data.cases)))
    d += Math.floor(timeDiff / calcInterval(perDay(data.deaths)))
    r += Math.floor(timeDiff / calcInterval(perDay(data.recovered)))

    console.log('loaded last session data ', dateKey, oldTime);

    document.getElementById('linf').textContent = c + " "
    document.getElementById('ldead').textContent = d + " "
    document.getElementById('lreco').textContent = r + " "
  }
  //saves the last Date being used as a key in the JSON
  saveSession(currentDate)
}

function onLoaded(data) {
  console.log(data)
  if ("country" in data) {
    //accomodate for different data structure in countries
    data = data.timeline
  }
  setInterval(updateValue, calcInterval(perDay(data.cases)), 'inf')
  window.document.title = 0
  setInterval(() => {
    window.document.title++
  }, calcInterval(perDay(data.cases)))
  setInterval(updateValue, calcInterval(perDay(data.deaths)), 'dead')
  setInterval(updateValue, calcInterval(perDay(data.recovered)), 'reco')
  if (window.localStorage)
    loadLastSession(data)
}
