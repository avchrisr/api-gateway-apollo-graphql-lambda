const { ApolloServer } = require('apollo-server-lambda')
const typeDefs = require('./schema/schema')
const resolvers = require('./resolvers/resolvers')

const server = new ApolloServer({
    typeDefs,
    resolvers,
    // playground: {
    //     endpoint: "/dev/graphql"
    // }
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
