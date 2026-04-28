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

app.use(express.static('./frontend/dist'))

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
  Person.find({}).then(people => {
    response.json(people)
  })
})

//get's the item of the specified id
app.get('/api/persons/:id', (request, response, next) => {
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
