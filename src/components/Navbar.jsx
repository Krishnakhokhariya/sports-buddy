import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom';


function Navbar() {
    const {currentUser, logout} = useAuth();
  return (
      <header className='bg-white shadow-sm'>
        <div className='max-w-6xl mx-auto px-4 py-3 flex items-center justify-between'>
            <Link to="/" className="font-heading text-lg text-primary">Sports Buddy</Link>
            <nav className='flex items-center gap-4'>
                {currentUser? (
                        <>
                        <span className='text-sm text-gray-700'>{currentUser.email}</span>
                        <button onClick={()=>logout()} className='text-sm text-red-500'>Logout</button>
                        </>
                    ):(
                        <>
                        <Link to="/login" className="text-sm">Login</Link>
                        </>
                    )
                }
            </nav>
        </div>
      </header>
  )
}

export default Navbar
