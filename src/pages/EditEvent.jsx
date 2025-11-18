import React, { useState, useEffect } from 'react';
import EventForm from '../components/forms/EventForm';
import { useNavigate, useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

function EditEvent() {
  const { id } = useParams();
  const [existingEvent, setExistingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEvent() {
      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setExistingEvent({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("Event not found");
          navigate("/events");
        }
      } catch (err) {
        console.error("Error fetching event: ", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id, navigate]);

  if (loading) return <p className="text-center mt-8">Loading event...</p>;
  if (!existingEvent) return <p className="text-center mt-8">Event not found</p>;

  return <EventForm existingEvent={existingEvent} onSubmitSuccess={() => navigate('/events')} />;
}

export default EditEvent;
