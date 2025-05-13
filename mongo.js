const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give pw as argument')
  process.exit(1)
}

const argv = process.argv

/*console.log('legth',argv.length)
console.log('2',argv[2])
console.log('3',argv[3])
console.log('4',argv[4])
process.exit(1)*/

const user = 'atstincer87'
const psw = argv[2]
const dbName = 'phonebook'

const url = `mongodb+srv://${user}:${psw}@cluster0.rni2sqj.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (argv.length === 3) {
  Person.find({}).then(result => {
    //console.log('result length',result.length)
    console.log('phonebook:')
    result.forEach(e => {
      console.log(e.name, e.number)
    })
    mongoose.connection.close()
  })
}

if (argv.length > 3) {
  const person = new Person({
    name: argv[3],
    number: argv[4]
  })
  person.save().then(() => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}



/*person.save().then(result => {
    console.log('Person saved in MongoDB')
    mongoose.connection.close()
})*/