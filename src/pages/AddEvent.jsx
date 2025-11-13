import React from 'react'
import EventForm from '../components/forms/EventForm'
// import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'

function AddEvent() {
  const navigate = useNavigate();
  return (
    // <Layout>
        <EventForm onSubmitSuccess={() => navigate('/events')}/>
    // </Layout>
  )
}

export default AddEvent
