// const { v4: uuidv4 } = require('uuid')
const faker = require('faker')

// const randomName = faker.name.findName()       // Rowan Nikolaus
// const randomEmail = faker.internet.email()     // Kassandra.Haley@erich.biz


function generateBook() {
    const genreCount = faker.datatype.number({ min: 0, max: 5 })
    const genres = []
    for (let i=0; i < genreCount; i++) {
        genres.push(faker.commerce.product())
    }

    const authorCount = faker.datatype.number({ min: 1, max: 3 })
    const authors = []
    for (let i=0; i < authorCount; i++) {
        authors.push(faker.name.findName())
    }

    return {
        id: faker.datatype.number({ min: 1, max: 100 }),
        title: faker.commerce.productName(),
        genres,
        authors,
        published: faker.datatype.boolean()
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
