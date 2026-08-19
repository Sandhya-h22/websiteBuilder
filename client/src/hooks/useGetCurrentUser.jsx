import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { serverUrl } from '../config'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function useGetCurrentUser() {
    const dispatch=useDispatch()
    useEffect(() => {
        const getCurrentUser = async () => {
            try {
              const result=await axios.get(`${serverUrl}/api/user/me`,{withCredentials:true})
              dispatch(setUserData(result.data))
            } catch (error) {
console.log(error)
            }
        }
        getCurrentUser()
    }, [dispatch])
}

export default useGetCurrentUser
