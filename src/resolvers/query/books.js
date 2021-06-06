const _ = require('lodash')
const { executeDbQuery } = require('../../db/db-handler')

const getBooks = async (args) => {

    // filter, commonFilter
    let selectQuery = `SELECT data FROM book`
    let whereQuery = ''
    let orderByQuery = ''
    let limitQuery = ''

    const queryParams = []

    if (_.isPlainObject(args.filter)) {
        Object.keys(args.filter).forEach(key => {
            if (!_.isNil(key)) {
                if (queryParams.length === 0) {
                    whereQuery += `WHERE`
                } else {
                    whereQuery += ` AND`
                }

                if (['title', 'genres', 'authors'].includes(key)) {
                    queryParams.push(`%${args.filter[key]}%`)
                    whereQuery += ` data->>'${key}' ILIKE $${queryParams.length}`
                } else {
                    queryParams.push(args.filter[key])
                    whereQuery += ` data->>'${key}' = $${queryParams.length}`
                }
            }
        })
    }

    const query = {
        selectQuery,
        whereQuery,
        orderByQuery,
        limitQuery
    }

    const result = await executeDbQuery(args, query, queryParams)

    // console.log('--------   getBooks result   -------')
    // console.log(JSON.stringify(result, null, 4))

    return result
}

const getBookById = async (id) => {
    let selectQuery = `SELECT data FROM book`
    let whereQuery = `WHERE data->'id' = $1`
    let orderByQuery = ''
    let limitQuery = ''

    const queryParams = [id]

    const query = {
        selectQuery,
        whereQuery,
        orderByQuery,
        limitQuery
    }

    const result = await executeDbQuery(query, queryParams)

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
