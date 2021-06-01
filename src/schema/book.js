const typeDefs = `
    # If an array has an exclamation point after it, the array cannot be null, but it _can_ be empty.

    """
    Query
    """
    type Query {
        getBookById(id: Int!): Book
        getBooks(filter: BookFilter, commonFilter: CommonFilter = {page: 1, limit: 100}): SearchBooksResponse
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

    type Book {
        id: Int
        title: String!
        genres: [String!]
        published: Boolean
        authors: [String!]
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

    """
    Mutation
    """
    type Mutation {
        # addBook(title: String!, author: String): Book
        addBook(input: BookInput): Book
        updateBookById(id: Int!, input: BookInput): UpdateBookByIdResponse
    }

    input BookInput {
        title: String!
        authors: [String!]
        genres: [String!]
        published: Boolean
    }

    type UpdateBookByIdResponse {
        success: Boolean!
        data: Book!
    }

    # media can be book OR video
    union Media = Book | Video
`

module.exports = typeDefs
