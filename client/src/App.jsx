import React, { lazy, Suspense } from 'react'
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Home from './pages/Home'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useSelector } from 'react-redux'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Generate = lazy(() => import('./pages/Generate'))
const WebsiteEditor = lazy(() => import('./pages/Editor'))
const LiveSite = lazy(() => import('./pages/LiveSite'))
const Pricing = lazy(() => import('./pages/Pricing'))

function App() {
  useGetCurrentUser()
  const {userData}=useSelector(state=>state.user)
  return (
   <BrowserRouter>
   <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
   <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/dashboard' element={userData?<Dashboard/>:<Home/>}/>
     <Route path='/generate' element={userData?<Generate/>:<Home/>}/>
     <Route path='/editor/:id' element={userData?<WebsiteEditor/>:<Home/>}/>
      <Route path='/site/:id' element={<LiveSite/>}/>
       <Route path='/pricing' element={<Pricing/>}/>
   </Routes>
    </Suspense>
   </BrowserRouter>
  )
}

export default App
