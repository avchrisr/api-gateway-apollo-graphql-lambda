const { Pool } = require('pg')
const { pgConnOptions } = require('../config/pg-conn')

const executeDbQuery = async (queryText, queryParams = []) => {
    const pool = new Pool(pgConnOptions)

    try {
        const result = await pool.query(queryText, queryParams)

        return {
            success: true,
            totalCount: result.rowCount,
            data: result.rows.map(row => row.data)
        }
    } catch (e) {
        console.error(e)
        throw e
    } finally {
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
