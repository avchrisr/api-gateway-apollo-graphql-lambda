const typeDefs = `
    # If an array has an exclamation point after it, the array cannot be null, but it _can_ be empty.

    """
    Query
    """
    type Query {
        me: User
        getUser: User
        getUserById(id: Int!): User
        getUsers(filter: UserFilter): SearchUsersResponse
        recommendedVideos(first: Int = 10): [Video!]!
    }

    input UserFilter {
        id: ID
        firstname: String
        lastname: String
        email: String
        company: Boolean
    }

    type SearchUsersResponse {
        success: Boolean!
        totalCount: Int!
        count: Int!
        pagination: Pagination
        data: [User!]!
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

    type Video {
        videoId: Int
        title: String
        description: String
        thumbnailUrl: String
        rating: Int
        score: Int
        trailer: Video
    }
`

module.exports = typeDefs
