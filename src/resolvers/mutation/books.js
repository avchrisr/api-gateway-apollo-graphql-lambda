const { getNextSequenceNumber } = require('../../db/db-handler')

const addBook = async (client, args) => {

    console.log('--------   addBook args   -------')
    console.log(JSON.stringify(args, null, 4))

    args.id = await getNextSequenceNumber(client)


    // const queryText = 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING id'
    // const queryParams = ['brianc', 'brian.m.carlson@gmail.com']
    // const result = await client.query(queryText, queryParams)

    // const insertPhotoText = 'INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)'
    // const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo']
    // await client.query(insertPhotoText, insertPhotoValues)

    const queryText = `INSERT INTO cr_test_table1 (data) VALUES ($1)`
    const queryParams = [args]     // input does NOT need to be stringified since data column type is jsonb, not json (string)

    await client.query(queryText, queryParams)
    return args
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
    addBook
}
