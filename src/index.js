const { ApolloServer, AuthenticationError } = require('apollo-server-lambda')
const { mergeTypeDefs } = require('@graphql-tools/merge')
const { print } = require('graphql')

const bookTypeDefs = require('./schema/book')
const userTypeDefs = require('./schema/user')
const typeDefs = mergeTypeDefs([bookTypeDefs, userTypeDefs])        // automatically de-dups duplicates if exist
// console.log(print(typeDefs))

const resolvers = require('./resolvers/resolvers')

const server = new ApolloServer({
    // debug: false,       // exclude exception.stacktrace. By default, Apollo Server omits the exception.stacktrace field if the NODE_ENV environment variable is set to either 'production' or 'test'
    typeDefs,
    resolvers,
    // playground: {
    //     endpoint: "/dev/graphql"
    // }
    formatError: (err) => {
        // Don't give the specific errors to the client.
        if (err.message.startsWith('Database Error: ')) {
            return new Error('Internal server error')
        }

        if (err.originalError instanceof AuthenticationError) {         // e.g. ValidationError
            return new Error('Different authentication error message!')
        }

        // Otherwise return the original error. The error can also
        // be manipulated in other ways, as long as it's returned.
        return err
    }
})

exports.handler = server.createHandler({
    // enable CORS
    // ref) https://www.apollographql.com/docs/apollo-server/deployment/lambda/
    cors: {
        origin: '*',
        credentials: true
    }
})

/*
exports.handler = async (event, context, callback) => {
    // console.info("EVENT:\n" + JSON.stringify(event, null, 4))
    return {
        body: 'Hello from api-gateway-apollo-graphql-lambda'
    }
}
*/
