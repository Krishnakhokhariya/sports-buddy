import React from 'react'
import EventForm from '../../components/forms/EventForm'
import { useNavigate } from 'react-router-dom'

function AdminAddEvent() {
    const navigate = useNavigate();
  return (
    <EventForm onSubmitSuccess={() => navigate('/admin/events')} />
  )
}

export default AdminAddEvent
