const { promisify } = require('util')
const { Pool } = require('pg')
const Cursor = require('pg-cursor')
const { pgConnOptions } = require('../config/pg-conn')

Cursor.prototype.readAsync = promisify(Cursor.prototype.read)

const executeDbQuery = async (queryText, queryParams = []) => {
    const pool = new Pool(pgConnOptions)
    const client = await pool.connect()
    let cursor

    console.log(queryText)

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
            data = [...data, ...rows]
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

const executeDbTransaction = async () => {
    const pool = new Pool(pgConnOptions)
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // const queryText = 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING id'
        // const queryParams = ['brianc', 'brian.m.carlson@gmail.com']
        // const result = await client.query(queryText, queryParams)

        // const insertPhotoText = 'INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)'
        // const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo']
        // await client.query(insertPhotoText, insertPhotoValues)

        await client.query('COMMIT')

        return {
            success: true,
            data: 'inserted object data'
        }

    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    } finally {
        client.release()
        await pool.end()
    }
}

module.exports = {
    executeDbQuery,
    executeDbTransaction
}
