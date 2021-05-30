const { executeDbQuery } = require('../../db/db-handler')

const getBooks = async () => {
    const queryText = `SELECT data FROM cr_test_table1`
    const queryParams = []

    const result = await executeDbQuery(queryText, queryParams)

    console.log('--------   getBooks result   -------')
    console.log(JSON.stringify(result, null, 4))

    return result
}

const getBookById = async (id) => {
    const queryText = `SELECT data FROM cr_test_table1 WHERE data->'id' = $1`
    const queryParams = [id]

    const result = await executeDbQuery(queryText, queryParams)

    console.log(`--------   getBookById result | id = ${id}   -------`)
    console.log(JSON.stringify(result, null, 4))

    return result.data
}


// getBooks().catch(console.error).finally(() => {
//     console.log('---  DONE  ---')
// })

// getBookById(4).catch(console.error).finally(() => {
//     console.log('---  DONE  ---')
// })


module.exports = {
    getBooks,
    getBookById
}
