/*

- using cursor, it's NOT possible jump/skip to a specific page.
  - i.e. using cursor, it's always sequential page navigation (whether it's prev or next)     ******  <------
    because the additional conditional WHERE clause logic is using the first (PREV) or last (NEXT) record's value used in sorting.

- -------------------------------------------------------------------------------------------
- ***   a Unique, Sequential Column Is Absolutely Necessary (leveraging DB Index)       *****
- -------------------------------------------------------------------------------------------

- Pagination should just be <PREV> | <NEXT> page buttons, instead of page numbers.
  - Q) should we still include the totalCount in response? Is it necessary?
        -->  I think this is still a useful info. This does require one additional DB query, which we were already doing anyway.

- don't use OFFSET as it's not performant in large data set.
  - instead add additional CONDITIONAL WHERE clause to utilize/leverage DB indexes.
  - we’re always fetching the next count rows before/after a specific reference point
    This will scale well for large datasets.
    We’re using a WHERE clause to fetch rows with id values less than the last id from the previous page.
    This lets us leverage the index on the column and the database doesn’t have to read any rows that we’ve already seen.

- always have explicit sort & limit in DB query, and use the same sort & limit in prev/next cursor queries

- next cursor (page): WHERE the sort-by-field-value > the last item of current sorted result
- prev cursor (page): WHERE the sort-by-field-value < the first item of current sorted result

  - most likely, the sort-by-field-value might be the unique "ID" or "updatedDate" field.
  - we’ll return an empty next_cursor which tells the client there are no more pages to be fetched.

- base64-encode the cursor value


Q) how to find out if NEXT page exists?
   - query the DB with (limit + 1), and use <2nd-from-last-field-value> for cursor. and exclude the very last record from the response to return.


ref)
- https://slack.engineering/evolving-api-pagination-at-slack/
- https://medium.com/swlh/how-to-implement-cursor-pagination-like-a-pro-513140b65f32


GRAPHQL Schema
----------------
type PageInfo {
    startCursor: String     # first record
    endCursor: String       # last record
    hasPrevPage: Boolean!
    hasNextPage: Boolean!
}

interface SearchResponse {
    success: Boolean!
    totalCount: Int!
    count: Int!
    pageInfo: PageInfo!
}

type SearchBooksResponse implements SearchResponse {
    success: Boolean!
    totalCount: Int!
    count: Int!
    pageInfo: PageInfo!
    data: [Book!]!
}




pageInfo {
    cursors: {
        before: 'AAAAA'    // if null means N/A
        after: 'BBBBB'     // if null means N/A
    },
    prev: '?sort=-updatedDate&limit=25&before=AAAAA'
    next: '?sort=-updatedDate&limit=25&after=BBBBB'
}


*/




const typeDefs = `
    # If an array has an exclamation point after it, the array cannot be null, but it _can_ be empty.
    # graphql does NOT allow input types to implement interfaces

    """
    Custom Scalars
    """
    scalar DateTime

    """
    Query
    """
    type Query {
        getBookById(id: Int!): Book
        getBooks(filter: BookFilter): SearchBooksResponse
    }

    type PageInfo {
        startCursor: String     # first record
        endCursor: String       # last record
        hasPrevPage: Boolean!
        hasNextPage: Boolean!
    }

    interface SearchResponse {
        success: Boolean!
        totalCount: Int!
        count: Int!
        pageInfo: PageInfo!
    }

    type SearchBooksResponse implements SearchResponse {
        success: Boolean!
        totalCount: Int!
        count: Int!
        pageInfo: PageInfo!
        data: [Book!]!
    }

    # limit (pageSize), cursorBefore, cursorAfter, sort
    input CommonFilter {
        limit: Int = 100
        before: String
        after: String
        sortOrder: SortOrder = DESC
    }

    enum SortOrder {
        ASC
        DESC
    }

    input BookFilter {
        commonFilter: CommonFilter
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
        authors: [Person!]
        updated: DateTime
    }

    type Person {
        id: Int
        firstname: String!
        lastname: String!
        dob: String
        email: String!
        company: String
        address: Address
        phoneNumber: String
        updated: DateTime
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
