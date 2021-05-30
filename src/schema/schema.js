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
        me: User
        getUser: User
        getUserById(id: Int!): User
        getBookById(id: Int!): Book
        getBooks(filter: BookFilter, commonFilter: CommonFilter = {page: 1, limit: 100}): SearchBooksResponse
        recommendedVideos(first: Int = 10): [Video!]!
    }

    # limit (pageSize), pageNumber, sort
    input CommonFilter {
        page: Int
        limit: Int
    }

    input BookFilter {
        id: ID
        title: String
        genres: String
        authors: String
        published: Boolean
    }

    type SearchBooksResponse {
        success: Boolean!
        totalCount: Int!
        count: Int!
        pagination: Pagination
        data: [Book!]!
    }

    type Pagination {
        prev: PaginationLimit
        next: PaginationLimit
    }

    type PaginationLimit {
        page: Int!
        limit: Int!
    }

    type User {
        id: Int
        firstname: String!
        lastname: String!
        email: String!
        company: String
        address: [Address]
        phoneNumber: PhoneNumber
        isEnabled: Boolean!
    }

    type Address {
        id: ID
        street1: String!
        street2: String
        street3: String
        city: String!
        state: String!
        zipCode: String!
        type: AddressType
    }

    enum AddressType {
        HOME
        WORK
        PRIMARY
        SECONDARY
    }

    type PhoneNumber {
        id: ID
        countryCode: String!
        areaCode: String!
        localCode: String!
        extension: String
        type: PhoneNumberType
    }

    enum PhoneNumberType {
        HOME
        WORK
        PRIMARY
        SECONDARY
    }

    type Book {
        id: Int
        title: String!
        genres: [String!]
        published: Boolean
        authors: [String!]
    }

    type Video {
        videoId: Int
        title: String
        description: String
        thumbnailUrl: String
        rating: Int
        score: Int
        trailer: Video
    }

    # -- enum cannot be numeric value...
    # enum Rating {
    #     1
    #     2
    #     3
    #     4
    #     5
    #     6
    #     7
    #     8
    #     9
    #     10
    # }

    interface Character {
        id: ID!
        name: String!
        friends: [Character]
        appearsIn: [Video]!
    }

    type Human implements Character {
        id: ID!
        name: String!
        friends: [Character]
        appearsIn: [Video]!
        age: Int
    }

    type Animal implements Character {
        id: ID!
        name: String!
        friends: [Character]
        appearsIn: [Video]!
        animalType: AnimalType
        size: AnimalSize
    }

    enum AnimalType {
        DOG
        CAT
        BIRD
        FISH
    }

    enum AnimalSize {
        SMALL
        MEDIUM
        LARGE
        X_LARGE
    }

    input BookInput {
        title: String!
        authors: [String!]
        genres: [String!]
        published: Boolean
    }

    """
    Mutation
    """
    type Mutation {
        # addBook(title: String!, author: String): Book
        addBook(input: BookInput): Book
        updateBookById(id: Int!, input: BookInput): Book
    }

    # media can be book OR video
    union Media = Book | Video
`

module.exports = typeDefs
