class UndergroundSystem {
  constructor() {
    // id -> { stationName, time }
    this.checkIns = new Map();

    // routeKey -> { totalTime, count }
    this.tripStats = new Map();
  }

  checkIn(id, stationName, t) {
    this.checkIns.set(id, {
      stationName,
      time: t,
    });
  }

  checkOut(id, stationName, t) {
    const checkInInfo = this.checkIns.get(id);

    const startStation = checkInInfo.stationName;
    const startTime = checkInInfo.time;

    const travelTime = t - startTime;
    const routeKey = this.getRouteKey(startStation, stationName);

    if (!this.tripStats.has(routeKey)) {
      this.tripStats.set(routeKey, {
        totalTime: 0,
        count: 0,
      });
    }

    const stats = this.tripStats.get(routeKey);
    stats.totalTime += travelTime;
    stats.count += 1;

    // Customer is no longer checked in
    this.checkIns.delete(id);
  }

  getAverageTime(startStation, endStation) {
    const routeKey = this.getRouteKey(startStation, endStation);
    const stats = this.tripStats.get(routeKey);

    return stats.totalTime / stats.count;
  }

  getRouteKey(startStation, endStation) {
    return `${startStation}->${endStation}`;
  }
}