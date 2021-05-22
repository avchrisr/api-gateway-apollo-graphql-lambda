const { ApolloServer } = require('apollo-server-lambda')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

const server = new ApolloServer({
    typeDefs,
    resolvers
})

exports.handler = server.createHandler()


/*
exports.handler = async (event, context, callback) => {
    // console.info("EVENT:\n" + JSON.stringify(event, null, 4))
    return {
        body: 'Hello from api-gateway-apollo-graphql-lambda'
    }
}
*/
