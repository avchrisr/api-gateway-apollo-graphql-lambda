// TODO: need to init db here, and create initial wrapper for DB transaction for UPSERT
const { executeDbTransaction } = require('../db/db-handler')

const { getBooks, getBookById } = require('./query/books')
const { addBook } = require('./mutation/books')

const resolvers = {
    Query: {
        getUser: (parent, args, context, info) => ({ id: 123, firstname: 'John', lastname: 'Doe', email: 'j.doe.test@example.com', company: 'Everguard', isEnabled: true }),
        getBooks: async (parent, args, context, info) => {

            console.log('-----   query getBooks args   -----')
            console.log(JSON.stringify(args, null, 4))

            const result = await getBooks()
            return result
        },
        getBookById: async (parent, args, context, info) => {

            console.log('-----   query getBookById args   -----')
            console.log(JSON.stringify(args, null, 4))

            const result = await getBookById(args.id)
            return result
        }
    },
    Mutation: {
        addBook: async (parent, args, context, info) => {

            console.log('-----   mutation addBook args   -----')
            console.log(JSON.stringify(args, null, 4))

            await executeDbTransaction(parent, args, context, info, addBook)
        }
    }
}

module.exports = resolvers
