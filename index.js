const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
//app.use(morgan('tiny'))

morgan.token('req-body',function(req,res){
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

app.use(cors())

let persons = [
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
]

/*app.get('/',(request,response)=>{
    response.send('<h1>Hello World</h1>')
})*/

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id',(request,response)=>{
    const person = persons.find(p=>p.id === request.params.id)
    if(!person){
        response.status(404).json({
            error:'persona no encontrada'
        })
    }
    response.json(person)
})

const getNextId = () => {
    const ids = persons.map(p => Number(p.id))
    let valid = false
    while(!valid){
        const randomId = Math.floor(Math.random()*100)
        if(!ids.includes(randomId)){
            valid = true
            return randomId
        }
    }
}

const validate = (person) => {
    if(!person) return {value:false,msg:'request body undifine'}
    if(!person.name) return {value:false,msg:'name undifine'}
    const names = persons.map(p => p.name.toLowerCase())
    if(names.includes(person.name.toLowerCase())) return {value:false,msg:'name must be unique'}
    if(!person.number) return {value:false,msg:'number undifine'}
    return {value:true}
}

app.post('/api/persons',(request,response)=>{
    const person = request.body
    console.log(person)
    const validation = validate(person)
    //console.log(validation)
    if(!validation.value){
        return response.status(400).json({
            error: validation.msg
        })
    }
    person.id = String(getNextId())
    //console.log(person)
    persons = persons.concat(person)
    response.json(person)
})

app.delete('/api/persons/:id',(request,response)=>{
    persons = persons.filter(p => p.id !== request.params.id)
    response.status(204).end()
})

app.get('/info', (request, response) => {
    let date = new Date()
    let htmlInfo = `<div>Phonebook has info for ${persons.length} people</div>
    <div>${date}</div>`
    response.send(htmlInfo)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
