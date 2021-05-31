const { executeDbTransaction } = require('../db/db-handler')
const { getBooks, getBookById } = require('./query/books')
const { addBook, updateBookById } = require('./mutation/books')

const resolvers = {
    Query: {
        getUser: (parent, args, context, info) => ({ id: 123, firstname: 'John', lastname: 'Doe', email: 'j.doe.test@example.com', company: 'Everguard', isEnabled: true }),
        getBooks: async (parent, args, context, info) => {
            return await getBooks(args)
        },
        getBookById: async (parent, args, context, info) => {
            return await getBookById(args.id)
        }
    },
    Mutation: {
        addBook: async (parent, args, context, info) => {
            return await executeDbTransaction(parent, args, context, info, addBook)
        },
        updateBookById: async (parent, args, context, info) => {
            return await executeDbTransaction(parent, args, context, info, updateBookById)
        }
    }
}

module.exports = resolvers
