require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.json())

morgan.token('req-body', function (req) {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

app.use(express.static('dist'))

/*let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]*/

/*app.get('/',(request,response)=>{
    response.send('<h1>Hello World</h1>')
})*/

/*const user = 'atstincer87'
const psw = process.argv[2]
const dbName = 'phonebook'

const url = `mongodb+srv://${user}:${psw}@cluster0.rni2sqj.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name:String,
    number:String
})

personSchema.set('toJSON',{
    transform:(document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Person = mongoose.model('Person',personSchema)*/

const errorHandler = (error, request, response, next) => {
  console.error(error)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

//get's all of them
app.get('/api/persons', (request, response) => {
  //response.json(persons)
  Person.find({}).then(people => {
    response.json(people)
  })
})

//get's the item of the specified id
app.get('/api/persons/:id', (request, response, next) => {
  /*const person = persons.find(p => p.id === request.params.id)
  if (!person) {
      response.status(404).json({
          error: 'persona no encontrada'
      })
  }
  response.json(person)*/
  Person.findById(request.params.id)
    .then(p => {
      if (!p) {
        return response.status(404).end()
      }
      response.json(p)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  Person.findById(request.params.id)
    .then(p => {
      if (p) {
        p.name = name
        p.number = number
        return p.save().then(result => response.json(result))
      } else {
        return response.status(404).end()
      }
    })
    .catch(error => next(error))
})

/*const getNextId = () => {
    const ids = persons.map(p => Number(p.id))
    let valid = false
    while (!valid) {
        const randomId = Math.floor(Math.random() * 100)
        if (!ids.includes(randomId)) {
            valid = true
            return randomId
        }
    }
}*/

//creates a new item
app.post('/api/persons', (request, response, next) => {
  const person = request.body
  console.log(person)
  const p = new Person({
    name: person.name,
    number: person.number
  })
  p.save()
    .then(personSaved => {
      response.json(personSaved)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  //persons = persons.filter(p => p.id !== request.params.id)
  //response.status(204).end()
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.find({})
    .then(people => {
      let date = new Date()
      let htmlInfo = `<div>Phonebook has info for ${people.length} people</div><div>${date}</div>`
      response.send(htmlInfo)
    })
})



app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
