import Hapi from '@hapi/hapi'
import { graphql, graphqlSGS } from './graphql.js'

// Query sent by land-grants-api/src/services/dal/queries.js.
const query = `
  query GetBusiness($sbi: ID!) {
    business(sbi: $sbi) {
      agreements {
        status
        paymentSchedules {
          optionCode
          sheetName
          parcelName
          actionArea
          actionMTL
          actionUnits
          startDate
          endDate
        }
      }
    }
  }
`

describe('DAL agreement query', () => {
  let server

  beforeEach(async () => {
    server = Hapi.server()
    server.route([graphql, graphqlSGS])
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  it.each(['/graphql', '/dummy-graphql/sgs'])(
    'serves the SBI-only agreement contract at %s',
    async (url) => {
      const response = await server.inject({
        method: 'POST',
        url,
        payload: { query, variables: { sbi: '107365747' } }
      })

      expect(response.statusCode).toBe(200)
      expect(response.result).toEqual({
        data: {
          business: {
            agreements: [
              {
                status: 'SIGNED',
                paymentSchedules: [
                  {
                    optionCode: 'CSAM3',
                    sheetName: 'SD7858',
                    parcelName: '5806',
                    actionArea: 1.063,
                    actionMTL: null,
                    actionUnits: null,
                    startDate: '2025-02-01T00:00:00Z',
                    endDate: '2028-01-31T00:00:00Z'
                  }
                ]
              }
            ]
          }
        }
      })
    }
  )

  it('returns an empty agreement list for a business without agreements', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/graphql',
      payload: { query, variables: { sbi: '106284736' } }
    })

    expect(response.statusCode).toBe(200)
    expect(response.result).toEqual({ data: { business: { agreements: [] } } })
  })

  it('returns a null business for an unknown SBI', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/graphql',
      payload: { query, variables: { sbi: '000000000' } }
    })

    expect(response.statusCode).toBe(200)
    expect(response.result).toEqual({ data: { business: null } })
  })

  it('preserves land and permission data for Grants UI requests with a CRN', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/graphql',
      payload: { variables: { sbi: '107365747', crn: '1103623923' } }
    })

    expect(response.statusCode).toBe(200)
    expect(response.result.data.business.land.parcels).toContainEqual({
      sheetId: 'SD7758',
      parcelId: '8179'
    })
    expect(
      response.result.data.customer.business.permissionGroups
    ).toContainEqual({
      id: 'COUNTRYSIDE_STEWARDSHIP_APPLICATIONS',
      level: 'SUBMIT',
      functions: ['Submit CS Application']
    })
  })
})
