const { Pool, Client } = require('pg')
const { pgConnOptions } = require('./config/pg-conn')

/* other pg pool / client usage examples

pool.query('SELECT * FROM cr_test_table1', (err, res) => {
    console.log(err, res)
    pool.end()
})

const client = new Client({
    host: 'cr-test-aurora-pg-provisioned-1.cluster-cg4dgtw3y7qa.us-west-2.rds.amazonaws.com',
    port: 5432,
    database: 'crtest',
    user: 'postgres',
    password: 'xxxxx'
})

client.connect()
client.query('SELECT NOW()', (err, res) => {
    console.log(err, res)
    client.end()
})

*/

const resolvers = {
    Query: {
        getUser: (parent, args, context, info) => ({ id: 123, name: 'John Doe', company: 'Everguard' }),
        getBooks: async (parent, args, context, info) => {
            const pool = new Pool(pgConnOptions)

            // no need to include in try/catch because if connecting throws an exception, no need to dispose the client, which would be undefined anyway.
            const client = await pool.connect()

            try {
                await client.query('BEGIN')

                // const queryText = 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING *'
                // const queryParams = ['brianc', 'brian.m.carlson@gmail.com']
                // const result = await client.query(queryText, queryParams)

                // const queryText = `SELECT data FROM cr_test_table1 WHERE data->'id' = $1`
                // const queryParams = [3]
                // const result = await client.query(queryText, queryParams)

                const queryText = `SELECT data FROM cr_test_table1`
                const result = await client.query(queryText)

                // console.log('rowCount =', result.rowCount)
                // console.log(result.rows)
                console.log(result.rows.map(row => row.data))

                return result.rows.map(row => row.data)


                // return {
                //     totalCount: result.rowCount,
                //     data: result.rows
                // }

                // const queryText = 'INSERT INTO users(name) VALUES($1) RETURNING id'
                // const res = await client.query(queryText, ['brianc'])
                // const insertPhotoText = 'INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)'
                // const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo']
                // await client.query(insertPhotoText, insertPhotoValues)
                // await client.query('COMMIT')

            } catch (e) {
                await client.query('ROLLBACK')
                throw e
            } finally {
                client.release()
                pool.end()
            }
        }
    }
}

// const resolvers = {
//     Query: {
//         user: (parent, args, context, info) => {
//             return fetchUserById(args.id)
//         }
//     }
// }


// if (process.env.NODE_ENV !== 'production') {
//     resolvers.Query.getBooks().catch(console.error).finally(() => {
//         console.log('---  DONE  ---')
//     })
// }


module.exports = resolvers
