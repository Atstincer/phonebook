import { useState, useEffect } from 'react'
import contactService from './services/contacts'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newPhoneNumber, setNewPhoneNumber] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [mensajeError, setMensajeError] = useState(null)

  let personsToShow = []

  useEffect(() => {
    //console.log('inside useEffect')
    contactService
      .getAll()
      .then(response => {
        //console.log('getting the response, inside then')
        setPersons(response.data)
      })
  }, [])

  const onNewNameAdded = (event) => {
    setNewName(event.target.value)
  }

  const onNewPhoneNumberAdded = (event) => {
    setNewPhoneNumber(event.target.value)
  }

  const onChangeFilterValue = (event) => {
    setFilterValue(event.target.value)
  }

  function alreadyExist() {
    const names = persons.map(person => person.name.toLowerCase())
    return names.includes(newName.toLowerCase())
  }

  function udContacto() {
    const contacto = persons.find(person => person.name.toLowerCase() === newName.toLocaleLowerCase())
    const contactoUpdated = { ...contacto, number: newPhoneNumber }
    //console.log('contacto', contacto)
    //console.log('new contacto', contactoUpdated)
    contactService
      .update(contactoUpdated)
      .then(response => {
        setPersons(persons.map(person => person.id === contacto.id ? response.data : person))
        setMensaje('Contacto actualizado correctamente')
        setTimeout(()=>{ setMensaje(null) },3000)
      })
      .catch(error => {
        setMensajeError(`El contacto '${contacto.name}' ya no está registrado.`)
        setPersons(persons.filter(p => p.id !== contacto.id))
        setTimeout(()=>{setMensajeError(null)},3000)
      })
  }

  function clearForm() {
    setNewName('')
    setNewPhoneNumber('')
  }

  const onSubmit = (event) => {
    event.preventDefault()
    if (alreadyExist()) {
      //alert(`${newName} is already in the phonebook`)
      const ok = confirm('El contacto ya existe....seguro que desea actualizar su numero?')
      //console.log('dialog returns', ok)
      if (ok) {
        udContacto()
        clearForm()
      }
      return
    }
    const newPerson = {
      name: newName,
      number: newPhoneNumber
    }
    contactService
      .create(newPerson)
      .then(response => {
        //console.log(response)
        setPersons(persons.concat(response.data))
        clearForm()
        setMensaje('Contacto creado correctamente')
        setTimeout(()=>{ setMensaje(null) },3000)
      })
      .catch(error => {
        console.log(error.response.data.error)
        setMensajeError(error.response.data.error)
        setTimeout(()=>{ setMensajeError(null) },3000)
      })
  }

  function applyFilter() {
    if (filterValue === '') {
      personsToShow = persons
      return
    }
    const filteredPersonsList = persons.filter(person => person.name.toLowerCase().includes(filterValue.toLowerCase()))
    personsToShow = filteredPersonsList
  }

  const onDeleteButtonClicked = id => {
    //console.log(`intentando eliminar contacto con id=${id}`)
    contactService
      .eliminar(id)
      .then(response => {
        //console.log('onDelete callback response:',response)
        setPersons(persons.filter(person => person.id !== id))
        setMensaje('Contacto eliminado correctamente')
        setTimeout(()=>{ setMensaje(null) },3000)
      })
      .catch(error => {
        const person = persons.find(p => p.id === id)
        setMensajeError(`El contacto '${person.name}' no está registrado.`)
        setPersons(persons.filter(p => p.id !== id))
        setTimeout(()=>{setMensajeError(null)},3000)
      })
  }

  applyFilter()

  return (
    <div>
      <h2>Phonebook</h2>
      <Mensaje mensaje={mensaje}/>
      <MensajeError mensaje={mensajeError}/>
      <Filter value={filterValue} onChange={onChangeFilterValue} />
      <h3>Add a new</h3>
      <PersonForm onSubmit={onSubmit} name={newName} onNameChange={onNewNameAdded}
        phone={newPhoneNumber} onPhoneChange={onNewPhoneNumberAdded} />
      <h3>Numbers</h3>
      <Persons personsList={personsToShow} onDelete={onDeleteButtonClicked} />
    </div>
  )
}

const MensajeError = ({mensaje}) => {
  if(mensaje === null) return null
  return (
    <div className='mensajeError'>
      {mensaje}
    </div>
  )
}

const Mensaje = ({mensaje}) => {
  if(mensaje === null) return null
  return (
    <div className='mensaje'>
      {mensaje}
    </div>
  )
}

const Persons = ({ personsList, onDelete }) => {
  return (
    <div>
      {personsList.map(person => <Contacto key={`${person.name}${person.id}`} contacto={person} onClick={() => { onDelete(person.id) }} />)}
    </div>
  )
}

const Contacto = ({ contacto, onClick }) => {
  return (
    <div>
      {contacto.name} {contacto.number}
      <button onClick={onClick}>delete</button>
    </div>
  )
}

const PersonForm = ({ onSubmit, name, onNameChange, phone, onPhoneChange }) => {
  return (
    <form onSubmit={onSubmit}>
      <div>
        name: <input value={name} onChange={onNameChange} />
      </div>
      <div>number: <input value={phone} onChange={onPhoneChange} /></div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Filter = ({ value, onChange }) => {
  return (
    <div>
      filter shown with <input value={value} onChange={onChange} />
    </div>
  )
}

export default App
