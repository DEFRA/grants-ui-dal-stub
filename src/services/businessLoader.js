import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fixturesPath =
  process.env.FIXTURES_PATH || path.join(__dirname, '../../fixtures')

const cache = {}

export async function loadBusinessData(sbi, crn) {
  const key = `${sbi}-${crn}`
  if (cache[key]) {
    return cache[key]
  }

  try {
    const land = JSON.parse(
      await fs.readFile(
        path.join(fixturesPath, 'land-data', `${sbi}.json`),
        'utf8'
      )
    )

    const customer = JSON.parse(
      await fs.readFile(
        path.join(fixturesPath, 'crn-data', `${crn}.json`),
        'utf8'
      )
    )

    return {
      ...land,
      customer
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {
        error: `No fixture found for sbi=${sbi}, crn=${crn}`
      }
    }
    throw err
  }
}
