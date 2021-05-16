const { ApolloServer, gql } = require('apollo-server-lambda')

const typeDefs = gql`
  type Query {
    user: User
  }

  type User {
    id: ID
    name: String
    company: String
  }
`

const resolvers = {
    Query: {
        user: () => ({ id: 123, name: 'John Doe', company: 'Everguard' })
    }
}

const server = new ApolloServer({ typeDefs, resolvers })

exports.handler = server.createHandler()


/*
exports.handler = async (event, context, callback) => {
    // console.info("EVENT:\n" + JSON.stringify(event, null, 4))
    return {
        body: 'Hello from api-gateway-apollo-graphql-lambda'
    }
}
*/
