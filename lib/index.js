
const service = {
  /**
    * Get the minute of a time of the day.
    * @param {String} str - 24 hour time string like 08:15, 18:05.
    * @returns {Number} = Amount of minute.
  **/
  getTimeAsMinuteOfDay: (str = '') => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!regex.test(str)) {
      return 0
    }
    const arr = str.split(':').map(Number)
    const [hour, minute] = arr
    return !hour ? minute : (hour * 60) + minute
  },
  /**
    * Registers a driver.
    * @param {Object} storage - Hash that keeps track of driver informations.
    * @param {String} driverName - Name of driver to register.
    * @returns {Object} = The hash with the driver information now stored in it.
  **/
  processDriverInfo: (storage, driverName = '') => {
    const trimmedName = driverName.trim()
    if (!trimmedName) {
      return storage
    }
    if (!storage[trimmedName]) {
      storage[trimmedName] = {miles: 0, duration: 0}
    }
    return storage
  },
  /**
    * Calculates speed
    * @param {Number} miles - number of miles.
    * @param {Number} hour - number of hours.
    * @returns {Number} = speed.
  **/
  speed: (miles, hour) => hour === 0 ? 0 : (miles / hour),
  /**
    * Gets information for a trip
    * @param {String} start - start time like 07:45.
    * @param {String} end - end time like 09:45.
    * @param {String} miles - miles like 11.0.
    * @returns {Object} = Object that has both tripSpeed and tripDuration attributes.
  **/
  getTripInfo: (start, end, miles) => {
    const tripStartTime = service.getTimeAsMinuteOfDay(start)
    const tripEndTime = service.getTimeAsMinuteOfDay(end)
    const tripDurationInHour = (tripEndTime - tripStartTime) / 60
    const tripSpeed = service.speed(Number(miles), tripDurationInHour)
    return {tripSpeed, tripDurationInHour}
  },
  /**
    * Registers a drivers trip.
    * @param {Object} storage - Hash that keeps track of driver informations.
    * @param {String} driverName - Name of driver to register.
    * @param {String} start - start time like 07:45.
    * @param {String} end - end time like 09:45.
    * @param {String} miles - miles like 11.0.
    * @returns {Object} = The hash with the driver trip information now stored in it.
  **/
  processTripInfo: (storage, driverName, start, end, miles) => {
    service.processDriverInfo(storage, driverName)
    const info = service.getTripInfo(start, end, miles)
    if (info.tripSpeed >= 5 && info.tripSpeed <= 100) {
      storage[driverName].miles += Number(miles)
      storage[driverName].duration += info.tripDurationInHour
    }
    return storage
  },
  /**
    * processes a single line text based on the COMMAND and stores retrieved information.
    * @param {Object} storage - Hash to keep track of informations.
    * @param {String} line - A single line text that starts with a COMMAND.
    * @returns {Object} = The hash that keeps track of informations.
  **/
  processEachLine: (storage, line) => {
    const words = line.split(' ')
    const [command, ...rest] = words
    if (command === 'Driver') {
      service.processDriverInfo(storage, ...rest)
    } else if (command === 'Trip') {
      service.processTripInfo(storage, ...rest)
    }
    return storage
  },
  /**
    * processes multi line string.
    * @param {String} data - A multi line text.
    * @returns {Object} = The hash that keeps track of informations.
  **/
  processDataAsArray: (data) => data.split('\n').reduce(service.processEachLine, {}),
  /**
    * processes the hash used as storage, sort it items.
    * @param {Object} storage - A hash with driver informations.
    * @returns {Array} = Array of driver with its informations.
  **/
  summary: (storage = {}) => Object.keys(storage).map((name) => ({name,
    miles: Math.round(storage[name].miles),
    speed: storage[name].duration ? Math.round(storage[name].miles / storage[name].duration) : 0 })).sort((a, b) => b.miles - a.miles),
  /**
    * processes multi line text, returns array of drivers and its respective informations.
    * @param {String} data - A multi line text.
    * @returns {Array} = Array of driver with its informations.
  **/
  processData: (data) => service.summary(service.processDataAsArray(data))
}
module.exports = service
