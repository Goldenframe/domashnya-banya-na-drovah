import React from 'react'
import { Link } from 'react-router-dom'

export default function PageNotFound() {
  return (
    <div>Похоже, такой страницы не существует!
        <Link to={'/login'}>Вернуться на гланую страницу</Link>
    </div>
  )
}
