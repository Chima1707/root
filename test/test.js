const expect = require('chai').expect
const sinon = require('sinon')
const lib = require('./../lib')
describe('Service object', () => {
  describe('#getTimeAsMinuteOfDay()', () => {
    it('should return 0 for invalid time string', () => {
      expect(lib.getTimeAsMinuteOfDay('')).to.equal(0)
    })

    it('should handle time string with lead zero', () => {
      expect(lib.getTimeAsMinuteOfDay('01:45')).to.equal(105)
    })

    it('should handle time string without lead zero', () => {
      expect(lib.getTimeAsMinuteOfDay('1:45')).to.equal(105)
    })

    it('should handle double digits time string', () => {
      expect(lib.getTimeAsMinuteOfDay('10:30')).to.equal(630)
    })
  })

  describe('#processDriverInfo()', () => {
    it('should not add a new driver for invalid input', () => {
      const storage = lib.processDriverInfo({}, '')
      expect(storage).to.eql({})
    })

    it('should always return the same storage object', () => {
      const storage = {}
      const result = lib.processDriverInfo(storage, '')
      expect(storage).to.equal(result)
    })

    it('should not add an exiting driver', () => {
      const name = 'driverName'
      const storage = {[name]: {miles: 0, duration: 0}}
      lib.processDriverInfo(storage, name)
      expect(storage).to.eql({[name]: {miles: 0, duration: 0}})
    })

    it('should add a new driver for valid input', () => {
      const name = 'driverName'
      const storage = {}
      lib.processDriverInfo(storage, name)
      expect(storage).to.eql({[name]: {miles: 0, duration: 0}})
    })
  })

  describe('#speed()', () => {
    it('should return zero for when hour is 0', () => {
      const result = lib.speed(5, 0)
      expect(result).to.equal(0)
    })

    it('should return correct result for valid params', () => {
      const result = lib.speed(5, 2)
      expect(result).to.equal(2.5)
    })
  })

  describe('#getTripInfo()', () => {
    it('should return correct result', () => {
      const result = lib.getTripInfo('07:30', '08:00', '10.0')
      expect(result).to.eql({tripSpeed: 20, tripDurationInHour: 0.5})
    })
  })

  describe('#processTripInfo()', () => {
    it('should call processDriverInfo with correct params to register driver if it has not been registered', () => {
      const spy = sinon.spy(lib, 'processDriverInfo')
      const storage = {}
      lib.processTripInfo(storage, 'driverName', '07:30', '08:00', '10.0')
      expect(spy.calledOnce).to.equal(true)
      expect(spy.calledWithExactly(storage, 'driverName')).to.equal(true)
      expect(storage).to.eql({driverName: {miles: 10, duration: 0.5}})
      spy.restore()
    })

    it('should always return the same storage object', () => {
      const storage = {}
      const result = lib.processTripInfo(storage, 'driverName', '07:30', '08:00', '10.0')
      expect(storage).to.equal(result)
    })

    it('should return correct result when called a new unregistered driver', () => {
      const storage = {}
      lib.processTripInfo(storage, 'driverName', '07:30', '08:00', '10.0')
      expect(storage).to.eql({driverName: {miles: 10, duration: 0.5}})
    })

    it('should ignore trips that have speeds above 100mph and below 5mph', () => {
      const storage = {}
      lib.processTripInfo(storage, 'driverName', '07:30', '08:00', '50.5')
      expect(storage).to.eql({driverName: {miles: 0, duration: 0}})
    })

    it('should accumulate result when called with a already registered driver', () => {
      const storage = {driverName: {miles: 10, duration: 0.5}}
      lib.processTripInfo(storage, 'driverName', '07:30', '08:00', '10.0')
      lib.processTripInfo(storage, 'driverName', '07:30', '08:00', '20.0')
      expect(storage).to.eql({driverName: {miles: 40, duration: 1.5}})
    })
  })

  describe('#processEachLine()', () => {
    it('should do nothing on unrecorgnized lines', () => {
      const processDriverSpy = sinon.spy(lib, 'processDriverInfo')
      const processTripSpy = sinon.spy(lib, 'processTripInfo')
      const storage = {}
      lib.processEachLine(storage, 'Unknown Bob')
      expect(processDriverSpy.called).to.equal(false)
      expect(processTripSpy.called).to.equal(false)
      processDriverSpy.restore()
      processTripSpy.restore()
    })

    it('should call correct processor on recorgnized line', () => {
      const processDriverSpy = sinon.spy(lib, 'processDriverInfo')
      const processTripSpy = sinon.spy(lib, 'processTripInfo')
      const storage = {}
      lib.processEachLine(storage, 'Driver Bob')
      expect(processDriverSpy.calledOnce).to.equal(true)
      expect(processTripSpy.called).to.equal(false)
      lib.processEachLine(storage, 'Trip Dan 07:15 07:45 17.3')
      expect(processTripSpy.calledOnce).to.equal(true)
      expect(processDriverSpy.calledTwice).to.equal(true)
      processDriverSpy.restore()
      processTripSpy.restore()
    })
  })

  describe('#summary()', () => {
    it('should summarize the value stored in storage object and sort them according to miles', () => {
      const storage = {Alex: {miles: 40.2, duration: 1.5}, Bob: {miles: 100.6, duration: 2.1}}
      const result = lib.summary(storage)
      expect(result).to.be.instanceof(Array)
      expect(result).to.eql([{name: 'Bob', miles: 101, speed: 48}, {name: 'Alex', miles: 40, speed: 27}])
    })
  })

  describe('#processDataAsArray()', () => {
    it('should process each line of string', () => {
      const data = 'Driver Dan\nDriver Alex\nTrip Dan 07:15 07:45 17.3\nTrip Dan 06:12 06:32 21.8\nTrip Alex 12:01 13:16 42.0'
      const processEachLineSpy = sinon.spy(lib, 'processEachLine')
      const storage = lib.processDataAsArray(data)
      expect(processEachLineSpy.callCount).to.equal(5)
      expect(storage).to.eql({Alex: {duration: 1.25, miles: 42}, Dan: {duration: 0.8333333333333333, miles: 39.1}})
      processEachLineSpy.restore()
    })
  })
})
