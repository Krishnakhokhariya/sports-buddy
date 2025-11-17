import React, {useEffect, useState} from 'react'
import { getAllSports, createSport, updateSport, deleteSport } from '../../utils/sports'
import AdminCRUD from '../../components/admin/AdminCRUD';

function AdminSports() {
  return (
    <AdminCRUD
      title="Manage Sports"
      fetchAll={getAllSports}
      createFn={createSport}
      updateFn={updateSport}
      deleteFn={deleteSport}
    />
  );
}

export default AdminSports
