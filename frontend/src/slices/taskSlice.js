import { apiSlice } from "./apiSlice";

const TASKS_URL = '/api/tasks';

export const tasksApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTaskList: builder.mutation({
            query: (data) => ({
                url: TASKS_URL,
                method: 'GET',
                body: data
            })
        }),

    })
});

export const { useGetTaskListMutation } = tasksApiSlice;