import { apiSlice } from "./apiSlice";

const USERS_URL = '/api/users';

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/login`,
                method: 'POST',
                body: data,
            }),
        }),
        register: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}`,
                method: 'POST',
                body: data,
            })
        }),
        updateUser: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/profile/${data._id}`,
                method: 'PUT',
                body: data
            })
        }),
        logout: builder.mutation({
            query: () => ({
                url: `${USERS_URL}/logout`,
                method: 'POST'
            })
        }),
        getUsers: builder.query({
            query: () => ({
                url: `${USERS_URL}/all`,
                method: 'GET'
            })
        })
    }),
});

export const { useLoginMutation, useRegisterMutation, useUpdateUserMutation, useLogoutMutation, useGetUsersQuery } = usersApiSlice;