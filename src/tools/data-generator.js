// const { v4: uuidv4 } = require('uuid')
const faker = require('faker')

// const randomName = faker.name.findName()       // Rowan Nikolaus
// const randomEmail = faker.internet.email()     // Kassandra.Haley@erich.biz


function generateBook() {
    const genreCount = faker.datatype.number({ min: 0, max: 5 })
    const genres = []
    for (let i = 0; i < genreCount; i++) {
        genres.push(faker.commerce.product())
    }

    const authorCount = faker.datatype.number({ min: 1, max: 3 })
    const authors = []
    for (let i = 0; i < authorCount; i++) {
        // authors.push(faker.name.findName())
        authors.push(generatePerson())
    }

    return {
        id: faker.datatype.number({ min: 1, max: 100 }),
        title: faker.commerce.productName(),
        genres,
        authors,
        published: faker.datatype.boolean()
    }
}

function generatePerson() {
    const firstname = faker.name.firstName()
    const lastname = faker.name.lastName()
    const dob = faker.date.between('1980-01-01', '2010-12-31')
    // const dob = new Date(faker.date.between('1980-01-01', '2010-12-31'))
    // const dob = new Date(faker.date.between('1980-01-01', '2010-12-31')).getTime()

    return {
        // username: faker.internet.userName().substring(0, 20),
        firstname,
        lastname,
        dob,
        email: `${firstname.replace(/[^\w]/g, '')}.${lastname.replace(/[^\w]/g, '')}.test@everguard.ai`,
        phoneNumber: '111-111-1111',
        address: {
            street1: faker.address.streetAddress(),
            city: faker.address.city(),
            state: faker.address.stateAbbr(),
            zipCode: faker.address.zipCode('#####')
            // countryCode: faker.address.countryCode()
        },
        company: faker.company.companyName()
        // employeeId: faker.internet.password(),
        // password: faker.internet.password() + 'Aa1'
    }
}


// -----------------
// helper functions
// -----------------

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min // both maximum and minimum are inclusive
}

module.exports = {
    generateBook,
    getRandomIntInclusive
}
