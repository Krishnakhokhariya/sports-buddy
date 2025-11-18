import React from 'react'
import AdminCRUD from '../../components/admin/AdminCRUD'
import { createCity, deleteCity, getAllCities, updateCity } from '../../utils/cities'

function AdminCities() {
  return (
    <AdminCRUD 
    title= "Manage Cities"
    fetchAll={async () =>{
      console.log("Fetching cities...");
      const city = await getAllCities();
      return city;
    }}
    createFn={createCity}
    updateFn={updateCity}
    deleteFn={deleteCity}/>
  )
}

export default AdminCities
