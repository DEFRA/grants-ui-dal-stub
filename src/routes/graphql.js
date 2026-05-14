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
          business: { permissionGroups: permissionGroups }
        }
      }
    }
  }
}

export { graphql }
