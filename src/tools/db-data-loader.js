// USAGE
// $ PGPASSWORD=xxxxx node db-data-loader.js

const PGPASSWORD = process.env.PGPASSWORD
if (!PGPASSWORD) {
    throw new Error('PGPASSWORD env var is required.')
}

const { Pool } = require('pg')
const { pgConnOptions } = require('../config/pg-conn')
const { generateBook } = require('./data-generator')

const execute = async () => {
    const pool = new Pool(pgConnOptions)
    const client = await pool.connect()

    try {
        await beginTransaction(client)

        const promises = []
        for (let i=0; i < 50; i++) {
            promises.push(insertBook(client))
        }
        await Promise.all(promises)

        await commitTransaction(client)

        return {
            success: true,
            // data: result
        }
    } catch (e) {
        await rollbackTransaction(client)
        throw e
    } finally {
        client.release()
        await pool.end()
    }
}


// -----------------
// helper functions
// -----------------

const insertBook = async (client) => {
    const book = generateBook()
    book.id = await getNextSequenceNumber(client)
    book.updated = new Date(Date.now())

    const queryText = `INSERT INTO book (data) VALUES ($1)`
    const queryParams = [book]     // input does NOT need to be stringified since data column type is jsonb, not json (string)

    await client.query(queryText, queryParams)
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

const getNextSequenceNumber = async (client) => {
    const result = await client.query(`SELECT nextval('sequence_number')`)
    return parseInt(result.rows[0].nextval)
}

execute().then(res => {
    console.log('-------   DONE   ------')
    console.log(res)
}).catch(console.error).finally(() => {
    console.log('-------   FINALLY DONE   ------')
})



