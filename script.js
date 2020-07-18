var urlParams = new URLSearchParams(location.search);
if (urlParams.has("country")) {
	fetch(
		[
			"https://corona.lmao.ninja/v2/historical/?lastdays=120",
			urlParams.get("country")
		].join("")
	)
		.then(response => {
			return response.json();
		})
		.then(onLoaded);
	document.getElementById("pagetitle").innerHTML += [
		"<br> in",
		urlParams.get("country")
	].join(" ");
} else
	fetch("https://corona.lmao.ninja/v2/historical/all")
		.then(response => {
			return response.json();
		})
		.then(onLoaded);

function perDay(inputArray) {
	k = Object.keys(inputArray);
	return inputArray[k[k.length - 1]] - inputArray[k[k.length - 2]];
}

function calcInterval(daily) {
	//milliseconds in a day divided by cases per day
	return 86400000 / daily;
}

function updateValue(elemId) {
	elem = document.getElementById(elemId);
	elem.textContent++;
	elem.textContent += " ";
	elem.parentElement.classList.toggle("even");
	elem = document.getElementById(["l", elemId].join(""));
	elem.textContent++;
	elem.textContent += " ";
	elem.parentElement.classList.toggle("even");
}

function saveSession(lastDate) {
	if (window.localStorage.getItem("lastTime") === null) {
		window.localStorage.setItem("dateKey", lastDate);
		window.localStorage.setItem("lastTime", Date.now());
	}
}

function loadLastSession(data) {
	currentDate = Object.keys(data.cases)[Object.keys(data.cases).length - 1];
	if (window.localStorage.getItem("lastTime") !== null) {
		dateKey = window.localStorage.getItem("dateKey");
		oldTime = parseInt(window.localStorage.getItem("lastTime"));
		timeDiff = (Date.now() - oldTime) % 86400000;
		var c = 0,
			d = 0,
			r = 0;
		if (Date.now() - oldTime > 86400000) {
			c = data.cases[currentDate] - data.cases[dateKey];
			d = data.deaths[currentDate] - data.deaths[dateKey];
			r = data.recovered[currentDate] - data.recovered[dateKey];
		}
		c += Math.floor(timeDiff / calcInterval(perDay(data.cases)));
		d += Math.floor(timeDiff / calcInterval(perDay(data.deaths)));
		r += Math.floor(timeDiff / calcInterval(perDay(data.recovered)));

		if (!c) {
			localStorage.clear();
			console.log("clearing session data, NaN found");
			c = 0;
			d = 0;
			r = 0;
		}
		console.log("loaded last session data ", dateKey, oldTime);
		document.getElementById("linf").textContent = c + " ";
		document.getElementById("ldead").textContent = d + " ";
		document.getElementById("lreco").textContent = r + " ";
	}
	//saves the last Date being used as a key in the JSON
	saveSession(currentDate);
}

function onLoaded(data) {
	console.log(data);
	if ("country" in data) {
		//accomodate for different data structure in countries
		data = data.timeline;
	}
	//set the intervals for the three different data types
	if (perDay(data.cases) > 0) {
		window.document.title = 0;
		setInterval(() => {
			window.document.title++;
		}, calcInterval(perDay(data.cases)));
		setInterval(updateValue, calcInterval(perDay(data.cases)), "inf");
	}
	if (perDay(data.deaths) > 0)
		setInterval(updateValue, calcInterval(perDay(data.deaths)), "dead");
	if (perDay(data.recovered) > 0)
		setInterval(updateValue, calcInterval(perDay(data.recovered)), "reco");
	if (window.localStorage) loadLastSession(data);
}
