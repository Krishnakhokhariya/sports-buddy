import React ,{useState, useEffect} from 'react'
import EventForm from '../components/forms/EventForm'
// import Layout from '../components/Layout'
import { useNavigate, useParams } from 'react-router-dom'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

function EditEvent() {
    const { id } = useParams();
  const [existingEvent, setExistingEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    async function fetchEvent(){
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()){
            setExistingEvent({id: docSnap.id, ...docSnap.data()});
        }
    }
    fetchEvent();
  }, [id]);

  if(!existingEvent) return <p>Loading events...</p>

  return (
    // <Layout>
        <EventForm existingEvent={existingEvent} onSubmitSuccess={() => navigate('/events')}/>
    // </Layout>
  )
}

export default EditEvent
