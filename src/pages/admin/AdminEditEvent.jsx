import React, {useState, useEffect} from 'react'
import EventForm from '../../components/forms/EventForm'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase'

function AdminEditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [existingEvent, setExistingEvent] = useState(null);

    useEffect(() =>{
        async function load(){
            const ref = doc(db, "events", id);
            const snap = await getDoc(ref);
            if(snap.exists()){
                setExistingEvent({id, ...snap.data()});
            } else{
                navigate('/admin/events');
            }
        }
        load();
    },[id])

    if(!existingEvent) return <p>Loading...</p>
  return (
    <EventForm existingEvent={existingEvent} onSubmitSuccess={() => navigate('/admin/events')} />
  )
}

export default AdminEditEvent
