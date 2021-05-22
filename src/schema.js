// CAVEAT
// --------
// in gql schema, don't end it with a comment. or you may get below runtime error:
// ex) GraphQLError: Syntax Error: Unexpected <EOF>.

const { gql } = require('apollo-server-lambda')

const typeDefs = gql`
    # If an array has an exclamation point after it, the array cannot be null, but it _can_ be empty.

    """
    Query
    """
    type Query {
        getUser: User
        getBooks: [Book]
    }

    type User {
        id: ID
        name: String
        company: String
    }

    type Book {
        id: ID
        title: String
        genres: [String]
        published: Boolean
        authors: [String]
    }
`

module.exports = typeDefs
