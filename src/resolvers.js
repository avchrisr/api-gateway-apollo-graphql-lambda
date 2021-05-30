const { executeDbQuery, executeDbTransaction } = require('./db-handler/db-handler')

const resolvers = {
    Query: {
        getUser: (parent, args, context, info) => ({ id: 123, name: 'John Doe', company: 'Everguard' }),
        getBooks: async (parent, args, context, info) => {
            const queryText = `SELECT data FROM cr_test_table1`
            const queryParams = []

            const result = await executeDbQuery(queryText, queryParams)

            return result.data
        }
    },
    // Mutation: {
    //     insertBook: () => {
    //         await executeDbTransaction()
    //     }
    // }
}

// const resolvers = {
//     Query: {
//         user: (parent, args, context, info) => {
//             return fetchUserById(args.id)
//         }
//     }
// }


// if (process.env.NODE_ENV !== 'production') {
//     resolvers.Query.getBooks().catch(console.error).finally(() => {
//         console.log('---  DONE  ---')
//     })
// }


module.exports = resolvers
