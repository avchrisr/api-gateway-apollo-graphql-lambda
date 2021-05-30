// The pool should be a long-lived object in your application.
// you want to instantiate ONE pool when your app starts up and use the same instance of the pool throughout the lifetime of your application.
// If you are frequently creating a new pool, you're not using the pool correctly.
// ex) "const pool = new Pool()" creates a NEW separate pool. There should not be multiple pools.

// *** CAVEAT ***
// In my experiments with Lambda in a web server use case, if I don't call pool.end() then lambda gets upset and waits for the process to complete, then errs out (you can change this with a config option).
//   ex) context.callbackWaitsForEmptyEventLoop = false
// If I do call pool.end(), then I need to re-create the pool for the next request.
// So for lambda web-server use case if you are using pools (because presumably you have several DB calls for a single function entry-point),
//   the "safest" use is to create the pool at the beginning of each request, and end() the pool just before returning your results via callback. (All the other reasons above are still valid.)

// ref)
// https://github.com/brianc/node-postgres/issues/1206
// https://stackoverflow.com/questions/62392980/aws-lambda-functions-nodejs-for-postgresql-timeout-error


const PGHOST = process.env.PGHOST || 'localhost'
const PGPORT = process.env.PGPORT || 15432
const PGUSER = process.env.PGUSER || 'postgres'
const PGPASSWORD = process.env.PGPASSWORD
const PGDATABASE = process.env.PGDATABASE || 'crtest'

const pgConnOptions = {
    ssl: {
        rejectUnauthorized: false
    },
    host: PGHOST,
    port: PGPORT,
    user: PGUSER,
    password: PGPASSWORD,
    database: PGDATABASE
}

module.exports = {
    PGHOST,
    PGPORT,
    PGUSER,
    PGPASSWORD,
    PGDATABASE,
    pgConnOptions
}
