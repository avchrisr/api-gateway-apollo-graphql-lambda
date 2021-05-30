const { promisify } = require('util')
const { Pool } = require('pg')
const Cursor = require('pg-cursor')
const { pgConnOptions } = require('../config/pg-conn')

Cursor.prototype.readAsync = promisify(Cursor.prototype.read)

const getNextSequenceNumber = async (client) => {
    const result = await client.query(`SELECT nextval('sequence_number')`)
    return parseInt(result.rows[0].nextval)
}

const executeDbQuery = async (queryText, queryParams = []) => {
    const pool = new Pool(pgConnOptions)
    const client = await pool.connect()
    let cursor

    try {
        // --- using a simple query
        // const result = await pool.query(queryText, queryParams)
        // const data = result.rows.map(row => row.data)

        // --- using a cursor to stream-read large data
        let data = []
        cursor = client.query(new Cursor(queryText, queryParams))

        const rowCount = 1000
        let rows = await cursor.readAsync(rowCount)

        while (rows.length > 0) {
            data = [...data, ...rows.map(row => row.data)]
            rows = await cursor.readAsync(rowCount)
        }

        // TODO: streaming response data

        return {
            success: true,
            totalCount: data.length,
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
