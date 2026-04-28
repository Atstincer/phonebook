import axios from 'axios'
const baseUrl = "/api/persons"

//http://localhost:3001

const getAll = () => {
    return axios.get(baseUrl)
}

const create = contact => {
    return axios.post(baseUrl,contact)
}

const eliminar = id => {
    return axios.delete(`${baseUrl}/${id}`)
}

const update = contact => {
    return axios.put(`${baseUrl}/${contact.id}`,contact)
}

export default {getAll,create,eliminar,update}
