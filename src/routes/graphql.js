import {
  loadBusinessData,
  loadPermissions
} from '../services/businessLoader.js'

const graphql = {
  method: 'POST',
  path: '/graphql',
  handler: async (request, h) => {
    const { variables } = request.payload || {}

    const sbi = variables?.sbi
    const crn = variables?.crn

    if (!sbi || !crn) {
      return h
        .response({
          errors: [{ message: 'sbi and crn are required variables' }]
        })
        .code(400)
    }

    const businessData = await loadBusinessData(sbi, crn)
    const permissionGroups = await loadPermissions(sbi, crn)

    return {
      data: {
        business: { ...businessData.business },
        customer: {
          ...businessData.customer,
          business: { permissionGroups }
        }
      }
    }
  }
}

/**
 * SBI-only agreement endpoint for land-grants-api.
 * Returns fixture agreements without executing the GraphQL query.
 * Known businesses without agreements return an empty list; unknown businesses return null.
 */
const graphqlSGS = {
  method: 'POST',
  path: '/dummy-graphql/sgs',
  handler: async (request, h) => {
    const sbi = request.payload?.variables?.sbi

    if (!sbi) {
      return h
        .response({
          errors: [{ message: 'Must provide variables.sbi in payload' }]
        })
        .code(400)
    }

    const { business } = await loadBusinessData(sbi)

    return {
      data: {
        business: business ? { agreements: business.agreements ?? [] } : null
      }
    }
  }
}

export { graphql, graphqlSGS }
