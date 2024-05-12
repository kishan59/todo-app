import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from './authSlice';

// remove this "/fetchApi" in production replace it with actual base url with domain,
    // it is just reference to calling api with proxy 
    // "/fetchApi" is defined in setupProxy.js file so whenever we call api like this it auto redirect request to 5000 port, even though it looks like 3000 port
const baseQuery = fetchBaseQuery({baseUrl: "/fetchApi"});       

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['User', 'Task'],
    endpoints: (builder) => ({})
});