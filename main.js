function create(c = "", t = "div") {
	let d = document.createElement(t);
	if (c !== "") {
		d.classList.add(...c.split(" "));
	}
	return d;
}

let temp = "";
let wind = "";
let prec = "";

let units = document.querySelector("header .units");
let dropmenu = document.querySelector("header .dropmenu");
units.addEventListener("click", (e) => {
	dropmenu.classList.toggle("hidden");
});
let celsiusOption = dropmenu.querySelector(".celsius");
let fahrenheitOption = dropmenu.querySelector(".fahrenheit");
let kmOption = dropmenu.querySelector(".km");
let mphOption = dropmenu.querySelector(".mph");
let mmOption = dropmenu.querySelector(".mm");
let inOption = dropmenu.querySelector(".in");

let day = document.querySelector(".hourly .currentday");
let dayDropmenu = day.querySelector(".dropmenu");

let search = document.querySelector(".search");
let searchButton = document.querySelector(".button");
let searchDropmenu = search.querySelector(".dropmenu");
let searchInput = search.querySelector("input");
let searchBar = search.querySelector(".input");
let searchTimer;
let prevSearch = "";
let results = search.querySelector(".results");
let selectedCity = null;
let chosen = false;
let reserved = null;

let data;
let errorMenu = document.querySelector(".error");
let app = document.querySelector(".app");
let noResult = document.querySelector(".noresult");
let result = document.querySelector(".result");

let api =
	"https://api.open-meteo.com/v1/forecast?daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,precipitation,apparent_temperature,weather_code,wind_speed_10m";

if (localStorage.getItem("selectedCity") != null) {
	selectedCity = JSON.parse(localStorage.getItem("selectedCity"));
	getWeather();
} else {
	result.classList.add("hidden");
}

function celsius(reload = true) {
	if (!celsiusOption.classList.contains("checked")) {
		celsiusOption.classList.add("checked");
		fahrenheitOption.classList.remove("checked");
		temp = "";
		localStorage.setItem("temp", temp);
		if (reload) getWeather();
	}
	getMode();
}
function fahrenheit(reload = true) {
	if (!fahrenheitOption.classList.contains("checked")) {
		fahrenheitOption.classList.add("checked");
		celsiusOption.classList.remove("checked");
		temp = "temperature_unit=fahrenheit";
		localStorage.setItem("temp", temp);
		if (reload) getWeather();
	}
	getMode();
}
function km(reload = true) {
	if (!kmOption.classList.contains("checked")) {
		kmOption.classList.add("checked");
		mphOption.classList.remove("checked");
		wind = "";
		localStorage.setItem("wind", wind);
		if (reload) getWeather();
	}
	getMode();
}
function mph(reload = true) {
	if (!mphOption.classList.contains("checked")) {
		mphOption.classList.add("checked");
		kmOption.classList.remove("checked");
		wind = "wind_speed_unit=mph";
		localStorage.setItem("wind", wind);
		if (reload) getWeather();
	}
	getMode();
}
function mm(reload = true) {
	if (!mmOption.classList.contains("checked")) {
		mmOption.classList.add("checked");
		inOption.classList.remove("checked");
		prec = "";
		localStorage.setItem("prec", prec);
		if (reload) getWeather();
	}
	getMode();
}
function inc(reload = true) {
	if (!inOption.classList.contains("checked")) {
		inOption.classList.add("checked");
		mmOption.classList.remove("checked");
		prec = "precipitation_unit=inch";
		localStorage.setItem("prec", prec);
		if (reload) getWeather();
	}
	getMode();
}

celsiusOption.addEventListener("click", celsius);
fahrenheitOption.addEventListener("click", fahrenheit);
kmOption.addEventListener("click", km);
mphOption.addEventListener("click", mph);
mmOption.addEventListener("click", mm);
inOption.addEventListener("click", inc);
let mode = false;
let switchMode = dropmenu.querySelector(".switch");

function getMode() {
	if (temp == "" && wind == "" && prec == "") {
		mode = false;
	} else if (temp != "" && wind != "" && prec != "") {
		mode = true;
	}
	setMode(false);
}
function modeChange() {
	mode = !mode;
	setMode();
}
function setMode(change = true) {
	localStorage.setItem("mode", mode);
	if (mode) {
		switchMode.textContent = "Switch to Metric";
		if (change) {
			fahrenheit(false);
			mph(false);
			inc(false);
		}
	} else {
		switchMode.textContent = "Switch to Imperial";
		if (change) {
			celsius(false);
			km(false);
			mm(false);
		}
	}
	getWeather();
}
switchMode.addEventListener("click", modeChange);

day.addEventListener("click", (e) => {
	if (!dayDropmenu.contains(e.target)) dayDropmenu.classList.toggle("hidden");
});
if (localStorage.getItem("mode") !== null) {
	mode = localStorage.getItem("mode") == "true";
}
setMode(false);

if (localStorage.getItem("temp") !== null) {
	temp = localStorage.getItem("temp");
	if (temp == "") celsius();
	else fahrenheit();
}

if (localStorage.getItem("wind") !== null) {
	wind = localStorage.getItem("wind");
	if (wind == "") km();
	else mph();
}

if (localStorage.getItem("prec") !== null) {
	prec = localStorage.getItem("prec");
	if (prec == "") mm();
	else inc();
}

async function fetchSearch(searchContent) {
	let progress = search.querySelector(".progress");
	let data;
	try {
		searchDropmenu.classList.remove("hidden");
		progress.classList.remove("hidden");
		let rawData = await fetch(
			"https://geocoding-api.open-meteo.com/v1/search?name=" +
				searchContent
		).then();
		data = await rawData.json();
	} catch {
		app.classList.add("hidden");
		errorMenu.classList.remove("hidden");
		return;
	} finally {
		progress.classList.add("hidden");
	}
	const allowedCodes = [
		"PPLC",
		"PPLA",
		"PPLA2",
		"PPLA3",
		"PPLA4",
		"PPL",
		"PPLX",
	];
	let filtered = null;
	if ("results" in data) {
		filtered = data.results.filter(
			(r) =>
				allowedCodes.includes(r.feature_code) &&
				(r.population ?? 0) >= 10000
		);
	}
	results.innerHTML = "";
	reserved = null;
	if (data == null || filtered == null || filtered.length == 0) {
		let noSearchResult = create("progress");
		noSearchResult.textContent = "No Result";
		results.append(noSearchResult);
	} else {
		let j = false;

		for (let i of filtered) {
			let d = create("option");
			d.textContent = i.name + ", " + i.country;
			d.addEventListener("click", () => {
				selectedCity = i;
				localStorage.setItem("selectedCity", JSON.stringify(i));
				chosen = true;
				searchInput.classList.add("chosen");
				searchInput.value = d.textContent;
				searchDropmenu.classList.add("hidden");
			});
			if (!j) {
				j = true;
				reserved = d;
			}
			results.append(d);
		}
	}
}
searchInput.addEventListener("input", suggestions);
searchInput.addEventListener("input", () => {
	chosen = false;
	searchInput.classList.remove("chosen");
});
searchInput.addEventListener("focus", suggestions);

function suggestions() {
	results.innerHTML = "";
	reserved = null;

	clearTimeout(searchTimer);
	searchDropmenu.classList.add("hidden");
	let searchContent = searchInput.value;
	if (
		searchContent.trim() !== "" &&
		(searchContent.trim() != prevSearch ||
			searchDropmenu.classList.contains("hidden"))
	) {
		prevSearch = searchContent.trim();
		searchTimer = setTimeout(fetchSearch, 300, searchContent);
	}
}

errorMenu.querySelector(".retry").addEventListener("click", () => {
	errorMenu.classList.add("hidden");
	app.classList.remove("hidden");
	searchInput.value = "";
	getWeather();
});
searchButton.addEventListener("click", () => {
	if (chosen || reserved != null) {
		result.style.display = "flex";
		noResult.style.display = "none";
		if (!chosen) {
			reserved.click();
		}
		getWeather();
	} else {
		result.style.display = "none";
		noResult.style.display = "block";
	}
});

async function getWeather() {
	if (selectedCity == null) return;
	result.classList.remove("hidden");

	result.classList.add("loading");
	try {
		data = await fetch(
			`${api}&latitude=${selectedCity.latitude}&longitude=${
				selectedCity.longitude
			}&timezone=${selectedCity.timezone.replace("/", "%2F")}${
				temp != "" ? "&" + temp : ""
			}${wind != "" ? "&" + wind : ""}${prec != "" ? "&" + prec : ""}`
		)
			.then((r) => r.json())
			.then((r) => r);
	} catch {
		app.classList.add("hidden");
		errorMenu.classList.remove("hidden");
		return;
	} finally {
		result.classList.remove("loading");
	}
	updateUI();
}

function updateUI() {
	let today = document.querySelector(".today");
	today.querySelector(".location").textContent =
		selectedCity.name + ", " + selectedCity.country;
	let date = new Date(data.current.time);
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	today.querySelector(".date").textContent = `${days[date.getDay()]}, ${
		months[date.getMonth()]
	} ${date.getDate()}, ${date.getFullYear()}`;
	today.querySelector(".temp").textContent = `${Math.round(
		+data.current.temperature_2m
	)}°${temp == "" ? "C" : "F"}`;
	let todayIcon = today.querySelector(".status");
	let weatherCode = +data.current.weather_code;
	const weatherCodeMap = {
		0: "sunny",
		1: "partly",
		2: "partly",
		3: "overcast",
		45: "fog",
		48: "fog",
		51: "drizzle",
		53: "drizzle",
		55: "drizzle",
		56: "drizzle",
		57: "drizzle",
		61: "rain",
		63: "rain",
		65: "rain",
		66: "rain",
		67: "rain",
		71: "snow",
		73: "snow",
		75: "snow",
		77: "snow",
		80: "rain",
		81: "rain",
		82: "rain",
		85: "snow",
		86: "snow",
		95: "storm",
		96: "storm",
		99: "storm",
	};
	todayIcon.className = "icon status";
	todayIcon.classList.add(weatherCodeMap[weatherCode]);

	let metro = app.querySelector(".metro");
	metro.querySelector(".feel .level").textContent =
		String(Math.round(+data.current.apparent_temperature)) +
		"°" +
		(temp == "" ? "C" : "F");
	metro.querySelector(".humidity .level").textContent =
		data.current.relative_humidity_2m + "%";
	metro.querySelector(".wind .level").textContent =
		data.current.wind_speed_10m + " " + (wind == "" ? "km/h" : "mph");
	metro.querySelector(".precipitation .level").textContent =
		data.current.precipitation + " " + (prec == "" ? "mm" : "in");

	let daily = [...app.querySelector(".daily").children];
	for (let i = 0; i < 7; i++) {
		let dayDate = new Date(data.daily.time[i]);
		daily[i].querySelector(".day").textContent = days[
			dayDate.getDay()
		].slice(0, 3);
		daily[i].querySelector(".icon").className = "icon sky";
		daily[i]
			.querySelector(".icon")
			.classList.add(weatherCodeMap[+data.daily.weather_code[i]]);

		daily[i].querySelector(".min").textContent =
			String(Math.round(data.daily.temperature_2m_min[i])) +
			"°" +
			(temp == "" ? "C" : "F");
		daily[i].querySelector(".max").textContent =
			String(Math.round(data.daily.temperature_2m_max[i])) +
			"°" +
			(temp == "" ? "C" : "F");
	}
	let hourlyTemps = [...document.querySelector(".hourly .group").children];
	let weekDays = [...dayDropmenu.children];
	let hourlyData = data.hourly;

	weekDays.forEach((el, ind) => {
		let ell = el.cloneNode(true);
		dayDropmenu.replaceChild(ell, el);
		weekDays[ind] = ell;
	});

	for (let i = 0; i < 7; i++) {
		let da = new Date(data.daily.time[i]);
		let d = weekDays[i];
		d.textContent = days[da.getDay()];
		d.addEventListener("click", () => {
			dayDropmenu.classList.add("hidden");
			for (let j = 0; j < 7; j++) {
				weekDays[j].classList.remove("selected");
			}
			d.classList.add("selected");

			for (let j = 0; j < 24; j++) {
				let k = i * 24 + j;
				let h = hourlyTemps[j];
				h.querySelector(".icon").className = "icon";
				h.querySelector(".icon").classList.add(
					weatherCodeMap[hourlyData.weather_code[k]]
				);
				let currenthour = new Date(hourlyData.time[k]).getHours();
				h.querySelector(".hour").textContent =
					String(currenthour % 12 || 12) +
					" " +
					(currenthour >= 12 ? "PM" : "AM");
				h.querySelector(".degree").textContent =
					String(Math.round(+hourlyData.temperature_2m[k])) +
					(temp == "" ? "C" : "F");
				day.querySelector(".day").textContent = d.textContent;
			}
		});
	}

	dayDropmenu.children[0].click();
}

document.addEventListener("click", (e) => {
	if (!e.isTrusted) return;
	if (!searchBar.contains(e.target) && !searchDropmenu.contains(e.target))
		searchDropmenu.classList.add("hidden");
	if (!dropmenu.contains(e.target) && !units.contains(e.target))
		dropmenu.classList.add("hidden");
	if (!day.contains(e.target)) dayDropmenu.classList.add("hidden");
});
