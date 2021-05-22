// CAVEAT for environment variable names
// --------------------------------------
// Lambda was unable to configure your environment variables because the environment variables you have provided contains reserved keys that are currently not supported for modification.
// Reserved keys used in this request: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

const MY_AWS_REGION = process.env.MY_AWS_REGION ?? 'us-west-2'
const MY_AWS_ACCESS_KEY_ID = process.env.MY_AWS_ACCESS_KEY_ID
const MY_AWS_SECRET_ACCESS_KEY = process.env.MY_AWS_SECRET_ACCESS_KEY
const RDS_SECRETS_MANAGER_ARN = process.env.RDS_SECRETS_MANAGER_ARN
const RDS_RESOURCE_ARN = process.env.RDS_RESOURCE_ARN

const AWS = require('aws-sdk')
const rdsDataService = new AWS.RDSDataService({
    region: MY_AWS_REGION,                     // required to access serverless RDS
    accessKeyId: MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: MY_AWS_SECRET_ACCESS_KEY
})

const resolvers = {
    Query: {
        getUser: (parent, args, context, info) => ({ id: 123, name: 'John Doe', company: 'Everguard' }),
        getBooks: async (parent, args, context, info) => {
            const sql = `SELECT * FROM cr_test_table1`
            // const sql = `SELECT data->'title' FROM cr_test_table1 WHERE data->'published' = 'false'`

            const sqlParams = {
                resourceArn: RDS_RESOURCE_ARN,          // serverless aurora rds
                secretArn: RDS_SECRETS_MANAGER_ARN,     // secrets manager ARN that stores RDS user credential
                sql,
                database: 'crtest',
                includeResultMetadata: true
            }

            const data = await rdsDataService.executeStatement(sqlParams).promise().catch(console.error)
            // console.log(data.records)
            /*      data.records
            [
                [
                    {
                        stringValue: '{"id": 1, "title": "Sleeping Beauties", "genres": ["Fiction", "Thriller", "Horror"], "published": false}'
                    }
                ],
                [
                    {
                        stringValue: '{"id": 2, "title": "Influence", "genres": ["Marketing & Sales", "Self-Help ", "Psychology"], "published": true}'
                    }
                ],
                [
                    {
                        stringValue: `{"id": 3, "title": "The Dictator's Handbook", "genres": ["Law", "Politics"], "authors": ["Bruce Bueno de Mesquita", "Alastair Smith"], "published": true}`
                    }
                ],
                [
                    {
                        stringValue: '{"id": 4, "title": "Deep Work", "genres": ["Productivity", "Reference"], "published": true}'
                    }
                ],
                [
                    {
                        stringValue: '{"id": 5, "title": "Siddhartha", "genres": ["Fiction", "Spirituality"], "published": true}'
                    }
                ]
            ]
            */

            return data.records.map(record => JSON.parse(record[0].stringValue))
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

module.exports = resolvers
