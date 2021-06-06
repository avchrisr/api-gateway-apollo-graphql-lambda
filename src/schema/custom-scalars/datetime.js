const { GraphQLScalarType, Kind } = require('graphql')

const dateTimeScalar = new GraphQLScalarType({
    name: 'DateTime',
    description: 'DateTime custom scalar type',
    serialize(value) {                                  // runs on Query
        if (typeof value === 'string') {
            return new Date(value)
        }
        // return value.getTime()                       // Convert outgoing Date to integer for JSON        // TODO: I think returning timestamp (UTC) is better so it can be localized by browser ???
        return value.toJSON()                           // Convert outgoing Date to ISO-8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
    },
    parseValue(value) {                                 // runs on Mutation
        return new Date(value)                          // Convert incoming integer to Date                 // TODO: I think storing in integer timestamp is better for fast indexing and lookup (cursor-based pagination) ??
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            return new Date(parseInt(ast.value, 10))    // Convert hard-coded AST string to integer and then to Date
        }
        // return null                                  // Invalid hard-coded value (not an integer)
        return new Date(Date.now())

        // if (ast.kind === Kind.STRING) {
        //     return new Date(ast.value)               // Convert hard-coded AST string to Date
        // }
        // return null                                  // Invalid hard-coded value (not a String)
    }
})

module.exports = dateTimeScalar
