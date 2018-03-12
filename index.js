#!/usr/bin/env node

const {processData} = require('./lib')
const fs = require('fs')
const assert = require('assert')

const [, , filePath] = process.argv
assert(filePath, 'Please specify a valid file path')

const data = fs.readFileSync(filePath).toString()
const result = processData(data)
result.forEach(({name, miles, speed}) => {
  console.log(`${name}: ${miles} miles${speed ? ` @ ${speed} mph` : ''}`)
})
