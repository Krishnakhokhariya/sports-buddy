import React from 'react'
import AdminCRUD from '../../components/admin/AdminCRUD'
import { createCity, deleteCity, getAllCities, updateCity } from '../../utils/cities'

function AdminCities() {
  return (
    <AdminCRUD 
    title= "Manage Cities"
    fetchAll={getAllCities}
    createFn={createCity}
    updateFn={updateCity}
    deleteFn={deleteCity}/>
  )
}

export default AdminCities
