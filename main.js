let units = document.querySelector("header .units");
let dropmenu = document.querySelector("header .dropmenu");
units.addEventListener("click", (e) => {
	dropmenu.classList.toggle("hidden");
});

let mode = false;
let switchMode = dropmenu.querySelector(".switch");

switchMode.addEventListener("click", (e) => {
	mode = !mode;
	if (mode) {
		switchMode.textContent = "Switch to Metric";
	} else switchMode.textContent = "Switch to Imperial";
});

let day = document.querySelector(".hourly .currentday");
let dayDropmenu = day.querySelector(".dropmenu");
day.addEventListener("click", () => {
	dayDropmenu.classList.toggle("hidden");
});
dayDropmenu.childNodes.forEach((e) => {
	e.addEventListener("click", () => {
		day.querySelector(".day").textContent = e.textContent;
	});
});
