import React from 'react';
import EventForm from '../components/forms/EventForm';
import { useNavigate } from 'react-router-dom';

function AddEvent() {
  const navigate = useNavigate();
  return <EventForm onSubmitSuccess={() => navigate('/events')} />;
}

export default AddEvent;
