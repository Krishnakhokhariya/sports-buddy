import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import Layout from "../components/Layout"
import SportCard from "../components/SportCard"
import Navbar from "../components/Navbar";


export default function Dashboard() {
    const {currentUser, logout} = useAuth();

    // async function handleLogout() {
    //     try{
    //         await logout();
    //     } catch(err){
    //         console.error("Logout failed: ", err)
    //     }
    // }
  
    // const cards = new Array(6).fill(0).map((_,i) => ({title: `Event ${i+1}`, subtitle: "Saturday 5PM"}));

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-heading mb-4">Dashboard</h2>
        <p className="text-gray-700">
          Signed in as: <span className="font-semibold">{currentUser?.email}</span>
        </p>
        <p className="mt-4">Your dashboard content will appear here.</p>
      </div>
    </div>

    // <Layout>
    //   <div className='max-w-6xl mx-auto px-4 py-6'>
    //     <h2 className='text-2xl font-headingmb-4'> Upcoming Matches</h2>
    //       <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
    //         {cards.map((c,i) => <SportCard key={i}{...c} />)}
    //       </div>
    //   </div>
    // </Layout>


    // <div>
    //   <h1>Dashboard</h1>
    //   <p>Signed in as: {currentUser?.email}</p>
    //   <button onClick={handleLogout}>Log Out</button>
    // </div>
  );
}


