const { Pool, Client } = require('pg')
const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = require('./config/pg-conn')

const pool = new Pool({
    // host: 'cr-test-aurora-pg-provisioned-1-proxy.proxy-cg4dgtw3y7qa.us-west-2.rds.amazonaws.com',
    // port: 5432,
    host: 'localhost',
    port: 15432,
    database: 'crtest',
    user: 'postgres',
    password: 'xxxxxxxxx'
})
pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res)
    pool.end()
})

// const client = new Client({
//     host: 'cr-test-aurora-pg-provisioned-1.cluster-cg4dgtw3y7qa.us-west-2.rds.amazonaws.com',
//     port: 5432,
//     database: 'crtest',
//     user: 'postgres',
//     password: 'xxxxxxxxx'
// })

// client.connect()
// client.query('SELECT NOW()', (err, res) => {
//     console.log(err, res)
//     client.end()
// })

