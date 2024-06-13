import axios from 'axios'
const baseUrl = 'http://localhost:8080/api/blogs'

let token = null

const setToken = newToken => {
  token = `Bearer ${newToken}`
}

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const getOne = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`)
  return response.data
}

const create = async newObject => {
  const config = {
    headers: { Authorization : token },
  }

  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = async (id, newObject) => {
  try {
    const response = await axios.put(`${baseUrl}/${id}`, newObject)
    return response.data
  } catch (e) {
    console.log('error', e)
  }
}

const remove = async (id) => {
  const config = {
    headers: { Authorization : token },
  }

  const response = await axios.delete(`${baseUrl}/${id}`, config)
  return response.data
}
// eslint-disable-next-line
export default { getAll, getOne, create, update, remove, setToken }