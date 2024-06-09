import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_HOSTNAME,
    //mode: 'no-cors'
})


export const apiSlice = createApi({
    baseQuery: baseQuery,
    // eslint-disable-next-line no-unused-vars
    endpoints: builder => ({}),
})