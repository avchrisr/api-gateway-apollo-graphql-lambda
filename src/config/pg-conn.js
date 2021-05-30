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
