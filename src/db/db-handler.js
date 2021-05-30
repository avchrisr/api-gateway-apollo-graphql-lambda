const _ = require('lodash')
const { promisify } = require('util')
const { Pool } = require('pg')
const Cursor = require('pg-cursor')
const { pgConnOptions } = require('../config/pg-conn')

Cursor.prototype.readAsync = promisify(Cursor.prototype.read)

const getNextSequenceNumber = async (client) => {
    const result = await client.query(`SELECT nextval('sequence_number')`)
    return parseInt(result.rows[0].nextval)
}

const executeDbQuery = async (args, queryText, queryParams = []) => {

    console.log(`args =`, args)
    console.log(`queryText =`, queryText)
    console.log(`queryParams =`, queryParams)

    const pool = new Pool(pgConnOptions)
    const client = await pool.connect()
    let cursor

    try {
        // Get Total Count
        // ----------------
        const totalCountQueryText = queryText.replace(/SELECT data FROM/i, 'SELECT COUNT(data) FROM')
        console.log(`totalCountQueryText =`, totalCountQueryText)

        // --- using a simple query. (using client.query should also be fine)
        const result = await pool.query(totalCountQueryText, queryParams)
        const totalCount = parseInt(_.get(result, 'rows[0].count', 0))

        // Common Filter handling
        const page = parseInt(_.get(args, 'commonFilter.page', 1))
        const limit = parseInt(_.get(args, 'commonFilter.limit', 100))
        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        queryParams.push(limit)
        queryText += ` LIMIT $${queryParams.length}`
        queryParams.push(startIndex)
        queryText += ` OFFSET $${queryParams.length}`

        // --- using a cursor to stream-read large data
        let data = []
        cursor = client.query(new Cursor(queryText, queryParams))

        const rowCount = 1000
        let rows = await cursor.readAsync(rowCount)

        while (rows.length > 0) {
            data = [...data, ...rows.map(row => row.data)]
            rows = await cursor.readAsync(rowCount)
        }

        // Pagination result
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


        // TODO: streaming response data

        return {
            success: true,
            totalCount,
            count: data.length,
            pagination,
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
