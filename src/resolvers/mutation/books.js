// ------------------------------
// Apollo GraphQL Error Handling
// ------------------------------
// unless it's a network or schema validation error, if error occurs during resolver,
//   apollo graphql still sends a 200 OK response with error stacktrace in response, and possibly partial data.
// ref) https://www.apollographql.com/docs/react/data/error-handling

const { ApolloError, UserInputError } = require('apollo-server-lambda')


const jsonmergepatch = require('json-merge-patch')
const { getNextSequenceNumber } = require('../../db/db-handler')

const addBook = async (client, args) => {

    console.log('--------   addBook args   -------')
    console.log(JSON.stringify(args, null, 4))

    const input = args.input
    input.id = await getNextSequenceNumber(client)

    // const queryText = 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING id'
    // const queryParams = ['brianc', 'brian.m.carlson@gmail.com']
    // const result = await client.query(queryText, queryParams)

    // const insertPhotoText = 'INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)'
    // const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo']
    // await client.query(insertPhotoText, insertPhotoValues)

    const queryText = `INSERT INTO cr_test_table1 (data) VALUES ($1)`
    const queryParams = [input]     // input does NOT need to be stringified since data column type is jsonb, not json (string)

    await client.query(queryText, queryParams)
    return input
}

const updateBookById = async (client, args) => {

    console.log('--------   updateBookById args   -------')
    console.log(JSON.stringify(args, null, 4))

    const id = args.id
    const input = args.input

    // merge JSON
    let queryText = `SELECT data FROM cr_test_table1 WHERE data->'id' = $1`
    let queryParams = [id]
    let result = await client.query(queryText, queryParams)

    if (result.rows.length === 0) {
        throw new UserInputError(`Book not found with id = ${id}`)                      // BAD_USER_INPUT
        // throw new ApolloError(`Book not found with id = ${id}`, 'CHRIS_ERROR_CODE')  // CHRIS_ERROR_CODE
        // throw new Error(`Book not found with id = ${id}`)                            // INTERNAL_SERVER_ERROR
    }

    const source = result.rows[0].data
    const target = jsonmergepatch.apply(source, input)

    queryText = `UPDATE cr_test_table1 SET data = $1 WHERE data->'id' = $2`
    queryParams = [target, id]

    await client.query(queryText, queryParams)
    return target
}


// const book = {
//     title: 'my latest bio 222',
//     authors: ['Chris Ro'],
//     genres: ['BIOGRAPHY'],
//     published: false
// }
// addBook(book).then(data => {
//     console.log('-------   response   -------')
//     console.log(JSON.stringify(data, null, 4))
// }).catch(console.error).finally(() => {
//     console.log('---  DONE  ---')
// })


module.exports = {
    addBook,
    updateBookById
}
