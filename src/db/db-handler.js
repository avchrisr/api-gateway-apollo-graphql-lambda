const _ = require('lodash')
const { ApolloError, UserInputError } = require('apollo-server-lambda')
const { promisify } = require('util')
const { Pool } = require('pg')
const Cursor = require('pg-cursor')
const { pgConnOptions } = require('../config/pg-conn')

Cursor.prototype.readAsync = promisify(Cursor.prototype.read)

const getNextSequenceNumber = async (client) => {
    const result = await client.query(`SELECT nextval('sequence_number')`)
    return parseInt(result.rows[0].nextval)
}

const SORT_ORDER = {
    ASC: 'ASC',
    DESC: 'DESC'
}

const CURSOR_ROW_COUNT = 1000

const executeDbQuery = async (args, {
    selectQuery = '',
    whereQuery = '',
    orderByQuery = '',
    limitQuery = ''
}, queryParameters = []) => {

    // console.log(`args =`, JSON.stringify(args, null, 4))
    // console.log(`queryParameters =`, queryParameters)

    const pool = new Pool(pgConnOptions)
    const client = await pool.connect()
    let cursor
    let cursorQuery = ''
    const queryParams = [...queryParameters]

    try {
        const sortOrder = _.get(args, 'commonFilter.sortOrder', SORT_ORDER.ASC)

        const limit = parseInt(_.get(args, 'commonFilter.limit', 100))
        if (limit > 100) {
            throw new UserInputError(`limit cannot be greater than 100`)
        }

        // handle user-provided Cursor
        const before = _.get(args, 'commonFilter.before')
        const after = _.get(args, 'commonFilter.after')
        if (!_.isNil(before) && !_.isNil(after)) {
            throw new UserInputError(`Either 'before' or 'after' filter option can be allowed, but not both.`)
        }

        let queryText = `${selectQuery} ${whereQuery}`

        // ----------------
        // Get Total Count
        // ----------------
        const totalCountQueryText = queryText.replace(/SELECT data FROM/i, 'SELECT COUNT(data) FROM')

        // --- using a simple query. (using client.query should also be fine)
        const result = await pool.query(totalCountQueryText, queryParams)
        const totalCount = parseInt(_.get(result, 'rows[0].count', 0))

        /*  PrevPageQuery
        -- DESC
        WITH this_set AS (
            SELECT data FROM book WHERE (data->'id')::bigint > 49 ORDER BY data->'id' ASC LIMIT (10 + 1)
        )
        SELECT data from this_set ORDER BY data->'id' DESC


        -- ASC
        WITH this_set AS (
            SELECT data FROM book WHERE (data->'id')::bigint < 51 ORDER BY data->'id' DESC LIMIT (10 + 1)
        )
        SELECT data from this_set ORDER BY data->'id' ASC
        */

        if (!_.isNil(after)) {
            // TODO: decode it first
            const decodedCursorValue = parseInt(after)
            queryParams.push(decodedCursorValue)
            // queryText += ` WHERE (data-->'id')::bigint > $${queryParams.length}`

            if (whereQuery.length === 0) {
                cursorQuery += 'WHERE '
            } else {
                cursorQuery += ' AND '
            }

            if (sortOrder === SORT_ORDER.ASC) {
                cursorQuery += `(data->>'id')::bigint > $${queryParams.length}`
            } else {
                cursorQuery += `(data->>'id')::bigint < $${queryParams.length}`
            }
        }

        if (!_.isNil(before)) {
            // TODO: decode it first
            const decodedCursorValue = parseInt(before)
            queryParams.push(decodedCursorValue)
            // queryText += ` WHERE (data-->'id')::bigint < $${queryParams.length}`

            if (whereQuery.length === 0) {
                cursorQuery += 'WHERE '
            } else {
                cursorQuery += ' AND '
            }

            if (sortOrder === SORT_ORDER.ASC) {
                cursorQuery += `(data->>'id')::bigint < $${queryParams.length} ORDER BY data->'id' DESC`
            } else {
                cursorQuery += `(data->>'id')::bigint > $${queryParams.length} ORDER BY data->'id' ASC`
            }

            const prevPageQueryParams = [...queryParams, limit + 1]
            const prevPageQueryText = `
            WITH this_set AS (
                ${selectQuery} ${whereQuery} ${cursorQuery} LIMIT $${prevPageQueryParams.length}
            ) SELECT data FROM this_set ORDER BY data->'id' ${sortOrder === SORT_ORDER.ASC ? 'ASC' : 'DESC'}`

            let data = []
            cursor = client.query(new Cursor(prevPageQueryText, prevPageQueryParams))

            let rows = await cursor.readAsync(CURSOR_ROW_COUNT)
            while (rows.length > 0) {
                data = [...data, ...rows.map(row => row.data)]
                rows = await cursor.readAsync(CURSOR_ROW_COUNT)
            }

            // Page Info
            const pageInfo = {}
            if (data.length === 0) {
                // if not specified, null is returned for start/end cursors
                pageInfo.hasPrevPage = false
                pageInfo.hasNextPage = false
            } else {
                if (data.length > limit) {
                    // remove first item (shift) for both ASC or DESC.
                    data.shift()
                    pageInfo.hasPrevPage = true
                } else {
                    pageInfo.hasPrevPage = false
                }

                if (sortOrder === SORT_ORDER.ASC) {
                    pageInfo.hasNextPage = await nextPageExists('>')
                } else {
                    pageInfo.hasNextPage = await nextPageExists('<')
                }

                pageInfo.startCursor = data[0].id
                pageInfo.endCursor = data[data.length - 1].id

                async function nextPageExists(op = '<') {
                    // see if there is NEXT page
                    let prevPageExistsQueryText = `SELECT EXISTS (${selectQuery} `

                    const queryParams = [...queryParameters]
                    queryParams.push(data[data.length - 1].id)
                    if (whereQuery.length === 0) {
                        prevPageExistsQueryText += 'WHERE '
                    } else {
                        prevPageExistsQueryText += `${whereQuery} AND `
                    }
                    prevPageExistsQueryText += `(data->>'id')::bigint ${op} $${queryParams.length})`

                    const result = await pool.query(prevPageExistsQueryText, queryParams)
                    return _.get(result, 'rows[0].exists', false)
                }
            }

            // TODO: streaming response data

            return {
                success: true,
                totalCount,
                count: data.length,
                pageInfo,
                data
            }
        }

        // orderByQuery = `ORDER BY (book.data->>'id')::bigint ${sortOrder}`
        orderByQuery = `ORDER BY data->'id' ${sortOrder}`

        // ----------------------
        // OFFSET LIMIT approach
        // ----------------------
        /*
        // Common Filter handling
        const page = parseInt(_.get(args, 'commonFilter.page', 1))
        const limit = parseInt(_.get(args, 'commonFilter.limit', 100))
        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        queryParams.push(limit)
        queryText += ` LIMIT $${queryParams.length}`
        queryParams.push(startIndex)
        queryText += ` OFFSET $${queryParams.length}`

        ...

        // Page Info
        const pagination = {}
        if (endIndex < totalCount) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }
        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }
        */

        // -------------------------
        // CURSOR-based Pagination
        // -------------------------
        queryParams.push(limit + 1)                     // intentionally adding 1 more record to the limit to figure whether next page exists or not.
        queryText += ` ${cursorQuery} ${orderByQuery} LIMIT $${queryParams.length}`

        // --- using a cursor to stream-read large data
        let data = []
        cursor = client.query(new Cursor(queryText, queryParams))

        let rows = await cursor.readAsync(CURSOR_ROW_COUNT)
        while (rows.length > 0) {
            data = [...data, ...rows.map(row => row.data)]
            rows = await cursor.readAsync(CURSOR_ROW_COUNT)
        }

        // Page Info
        const pageInfo = {}
        if (data.length === 0) {
            // if not specified, null is returned for start/end cursors
            pageInfo.hasPrevPage = false
            pageInfo.hasNextPage = false
        } else {
            if (data.length > limit) {
                // remove the last item (pop) for both ASC or DESC.
                data.pop()
                pageInfo.hasNextPage = true
            } else {
                pageInfo.hasNextPage = false
            }

            if (sortOrder === SORT_ORDER.ASC) {
                pageInfo.hasPrevPage = await prevPageExists('<')
            } else {
                pageInfo.hasPrevPage = await prevPageExists('>')
            }

            pageInfo.startCursor = data[0].id
            pageInfo.endCursor = data[data.length - 1].id
        }

        async function prevPageExists(op = '>') {
            // see if there is PREV page
            let prevPageExistsQueryText = `SELECT EXISTS (${selectQuery} `

            const queryParams = [...queryParameters]
            queryParams.push(data[0].id)
            if (whereQuery.length === 0) {
                prevPageExistsQueryText += 'WHERE '
            } else {
                prevPageExistsQueryText += `${whereQuery} AND `
            }
            prevPageExistsQueryText += `(data->>'id')::bigint ${op} $${queryParams.length})`

            const result = await pool.query(prevPageExistsQueryText, queryParams)
            return _.get(result, 'rows[0].exists', false)
        }

        // TODO: streaming response data

        return {
            success: true,
            totalCount,
            count: data.length,
            pageInfo,
            data
        }
    } catch (e) {
        console.error(e)
        throw e
    } finally {
        if (cursor) {
            cursor.close()
        }
        client.release()
        await pool.end()
    }
}


const beginTransaction = async (client) => {
    await client.query('BEGIN')
}

const commitTransaction = async (client) => {
    await client.query('COMMIT')
}

const rollbackTransaction = async (client) => {
    await client.query('ROLLBACK')
}

const executeDbTransaction = async (parent, args, context, info, handlerFn) => {
    const pool = new Pool(pgConnOptions)
    const client = await pool.connect()

    try {
        await beginTransaction(client)

        const result = await handlerFn(client, args)

        await commitTransaction(client)

        return {
            success: true,
            data: result
        }
    } catch (e) {
        await rollbackTransaction(client)
        throw e
    } finally {
        client.release()
        await pool.end()
    }
}

module.exports = {
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    getNextSequenceNumber,
    executeDbQuery,
    executeDbTransaction
}
