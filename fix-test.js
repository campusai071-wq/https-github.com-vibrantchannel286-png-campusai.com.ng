const nDate = "2026-08-15";
const t = new Date(nDate).getTime();
const todayMidnight = new Date("Aug 05, 2026").getTime();
console.log(t > todayMidnight);
