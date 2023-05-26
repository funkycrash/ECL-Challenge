// Emerald Cloud Labs Challenge
// Author: Nicolas Funke
// Website: www.nicolasfunke.com
// Date: 2023-05-26

const fs = require('fs')

/**
 * The function reads a data file, validates the data, and returns a promise that resolves with an
 * array of objects containing the score and record.
 * @param filePath - The path to the data file that needs to be parsed.
 * @returns A Promise object is being returned.
 */
function parseDataFile (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (error, data) => {
      if (error) {
        reject(error)
        return
      }
      const lines = data
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')

      const linePromises = lines.map(async line => {
        const colonIndex = line.indexOf(':')
        const scoreStr = line.substring(0, colonIndex).trim()
        const recordStr = line.substring(colonIndex + 1).trim()

        const { score, record } = validateScoreAndRecord(scoreStr, recordStr)

        return { score, record }
      })

      Promise.all(linePromises)
        .then(records => resolve(records))
        .catch(error => reject(error))
    })
  })
}

/**
 * The function validates a score and a record, ensuring that the score is an integer and the record is
 * a valid JSON dictionary with an "id" field.
 * @param scoreStr - A string representing the score to be validated and recorded.
 * @param recordStr - The `recordStr` parameter is a string that represents a JSON dictionary
 * containing information about a record.
 * @returns An object containing the validated `score` and `record` values.
 */
function validateScoreAndRecord (scoreStr, recordStr) {
  const score = parseInt(scoreStr, 10)
  if (isNaN(score)) {
    console.error('Invalid score: not an integer')
    process.exit(2)
  }

  let record
  try {
    record = JSON.parse(recordStr)
  } catch (error) {
    console.error('Invalid record: not a valid JSON dictionary')
    process.exit(2)
  }

  if (typeof record !== 'object' || Array.isArray(record) || record === null) {
    console.error('Invalid record: not a JSON dictionary')
    process.exit(2)
  }

  if (!('id' in record)) {
    console.error('Invalid record: missing "id" field')
    process.exit(2)
  }

  return { score, record }
}

/**
 * This function takes an array of records, sorts them by score in descending order, selects the top
 * "count" records, and returns an array of objects containing the score and record ID.
 * @param records - The `records` parameter is an array of objects, where each object represents a
 * record and has two properties: `score` (a number representing the score of the record) and `record`
 * (an object representing the details of the record).
 * @param count - The `count` parameter is the number of highest records that we want to retrieve from
 * the `records` array.
 * @returns The function `getHighestRecords` is returning an array of objects that contain the highest
 * `count` number of records sorted by score in descending order. Each object in the array has two
 * properties: `score` which is the score of the record, and `record` which is the ID of the record.
 */
function getHighestRecords (records, count) {
  return records
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(record => ({ score: record.score, record: record.record.id }))
}

/**
 * The function reads a data file, retrieves the highest records based on a count, and outputs them in
 * JSON format.
 */
async function main () {
  const args = process.argv.slice(2)
  if (args.length !== 2) {
    console.error('Usage: node score.js <data_file> <count>')
    process.exit(1)
  }

  const filePath = args[0]
  const count = parseInt(args[1])

  if (isNaN(count) || count <= 0) {
    console.error('Invalid count value')
    process.exit(2)
  }

  try {
    const records = await parseDataFile(filePath)
    const highestRecords = getHighestRecords(records, count)
    const output = JSON.stringify(highestRecords, null, 2)
    console.log(output)
    process.exit(0)
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('File not found')
      process.exit(1)
    } else {
      console.error('An error occurred:', error.message)
      process.exit(2)
    }
  }
}

main()
