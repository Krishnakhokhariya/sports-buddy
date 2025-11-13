import React from 'react'

const SportCard = ({title, subtitle}) => {
  return (
    <div className='bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition'>
      <h3 className='font-heading text-lg text-primary'>{title}</h3>
      <p className='text-gray-500 text-sm mt-1'>{subtitle}</p>
    </div>
  )
}

export default SportCard
