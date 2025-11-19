import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    sports: 0,
    cities: 0,
    areas: 0,
    logs: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [eventsPerMonth, setEventsPerMonth] = useState([]);
  const navigate = useNavigate();

  async function loadStats() {
    const userSnap = await getDocs(collection(db, "users"));
    const eventSnap = await getDocs(collection(db, "events"));
    const sportSnap = await getDocs(collection(db, "sports"));
    const citySnap = await getDocs(collection(db, "cities"));
    const areaSnap = await getDocs(collection(db, "areas"));
    const logSnap = await getDocs(collection(db, "logs"));

    setStats({
      users: userSnap.size,
      events: eventSnap.size,
      sports: sportSnap.size,
      cities: citySnap.size,
      areas: areaSnap.size,
      logs: logSnap.size,
    });
  }

  async function loadRecentEvents() {
    const q = query(
      collection(db, "events"),
      orderBy("updatedAt", "desc"),
      limit(5)
    );
    const snap = await getDocs(q);
    setRecentEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function loadEventsPerMonth() {
    const snap = await getDocs(collection(db, "events"));
    const counts = {};

    snap.docs.forEach(doc => {
      const data = doc.data();
      if(data.dateTime?.toDate){
        const date = data.dateTime.toDate();
        
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        console.log(date, month); 
        counts[month] = (counts[month] || 0) + 1;
      }
    });

   const chartData = Object.keys(counts)
  .sort()
  .map(month => ({ month, events: counts[month] }));
    console.log("Event counts by month:", counts);
    setEventsPerMonth(chartData);
  }


  useEffect(() => {
    loadStats();
    loadRecentEvents();
    loadEventsPerMonth();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="p-4 bg-white shadow rounded-lg">
        <h3 className="text-sm text-gray-500">Total Users</h3>
        <p className="text-2xl font-body">{stats.users}</p>
      </div>

      <div className="p-4 bg-white shadow rounded-lg">
        <h3 className="text-sm text-gray-500">Total Events</h3>
        <p className="text-2xl font-body">{stats.events}</p>
      </div>

      <div className="p-4 bg-white shadow rounded-lg">
        <h3 className="text-sm text-gray-500">Total Sports</h3>
        <p className="text-2xl font-body">{stats.sports}</p>
      </div>

      <div className="p-4 bg-white shadow rounded-lg">
        <h3 className="text-sm text-gray-500">Total Cities</h3>
        <p className="text-2xl font-body">{stats.cities}</p>
      </div>

      <div className="p-4 bg-white shadow rounded-lg">
        <h3 className="text-sm text-gray-500">Total Areas</h3>
        <p className="text-2xl font-body">{stats.areas}</p>
      </div>

      <div className="p-4 bg-white shadow rounded-lg">
        <h3 className="text-sm text-gray-500">Total Logs</h3>
        <p className="text-2xl font-body">{stats.logs}</p>
      </div>

      <div className="mt-8">
        <div className="bg-white p-4 rounded-lg shadow space-y-2">
          <h2 className="text-lg font-semibold mb-3">Recent Events</h2>
          {recentEvents.length === 0 && (
            <p className="text-gray-500 text-sm">No recent events found.</p>
          )}

          {recentEvents.map(event => (
            <div 
              key={event.id}
              className="flex justify-between items-center border-b pb-2 last:border-none"
            >
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-gray-500">
                  {event.updatedAt?.toDate
                    ? new Date(event.updatedAt.toDate()).toLocaleString()
                    : "No date"}
                </p>
              </div>

              <button
                onClick={() => navigate(`/admin/events?open=${event.id}`)}
                className="text-blue-600 text-sm hover:scale-110 transition"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Events Per Month</h2>
        {eventsPerMonth.length === 0?(
          <p className="text-gray-500 text-sm">No event data available.</p>
        ):(
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={eventsPerMonth} margin={{top:20, right:30, left:0, bottom:5}}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis/>
              <Tooltip />
              <Bar dataKey="events" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
