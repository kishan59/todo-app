import { apiSlice } from "./apiSlice";

const TASKS_URL = '/api/tasks';

const reorderTasks = (tasks, type, baseOrder) => {
    for(let i = tasks.length -1; i >= 0; i--){
        tasks[i].order[type] = baseOrder + (tasks.length - 1 - i);
    }
}


export const tasksApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTaskList: builder.query({
            query: (data) => ({
                url: TASKS_URL,
                method: 'GET',
                params: data
            }),
            providesTags: (result) => result?.data ? [...result.data.map(({ _id }) => ({ type: 'Task', id: _id })), 'Task'] : ['Task'], 
            // this can be use for pagination (load more) functionality....
              // flaw is it's not working, it's only returning new page data not keeping the old ones
            // serializeQueryArgs: ({ queryArgs }) => {
            //     const newQueryArgs = { ...queryArgs };
            //     if (newQueryArgs.page) {
            //         delete newQueryArgs.page;
            //     }
            //     return newQueryArgs;
            // },
            // merge: (currentData, newData, { arg }) => {
            //     const { limit, page } = arg; // Extract relevant arguments
            //     console.log("check me=========>", currentData,"----------------",newData)
            //     if (limit !== 0 && page > 1) { // Check for pagination conditions
            //         // Concatenate data for subsequent pages
            //                  // also need some kind of indication that we reached the limit like if we get empty array.... so we can hide the load more btn
            //         return { ...currentData, data: [...currentData.data, ...newData.data] };
            //     } else {
            //         // Default behavior for first page or no limit
            //         return newData;
            //     }
            // }

        }),

        
        // ************* MOST IMPORTANT *************** if filter is applied then we will disable reordering...
        reorderTaskList: builder.mutation({
            query: (data) => ({
                url: `${TASKS_URL}/reorder`,
                method: 'POST',
                body: data
            }),
            invalidatesTags: [{ type: 'Task', id: 'LIST' }],
            async onQueryStarted({ taskOrders, orderType, filters = {}, additionalFilters = false }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    tasksApiSlice.util.updateQueryData('getTaskList', filters, (draft) => {
                        let tasks = draft.data;
                        if(Array.isArray(tasks)) {   
                            const baseOrder = tasks.length ? tasks[tasks.length - 1].order[orderType] : 0; 
                            const reorderedData = [];
                            for (const id of taskOrders) {
                                const matchingObject = tasks.find(obj => obj._id === id);
                                if (matchingObject) {
                                    reorderedData.push(matchingObject);
                                }
                            }
                            draft.data = reorderedData;
                            reorderTasks(draft.data, orderType, baseOrder);
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),

        // if filter is applied then we won't call reordering common function because api will take care of the order when we change filter values just add/change/remove the given task in delete/add/update
        deleteTask: builder.mutation({
            query: ({ taskId, orderType }) => ({
                url: `${TASKS_URL}/${taskId}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Task', id: 'LIST' }],
            async onQueryStarted({ taskId, orderType, filters = {}, additionalFilters = false }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    tasksApiSlice.util.updateQueryData('getTaskList', filters, (draft) => {
                        let tasks = draft.data;
                        if(Array.isArray(tasks)) {                            
                            const index = tasks.findIndex((t) => t._id === taskId);
                            if (index !== -1) {
                                const baseOrder = tasks.length ? tasks[tasks.length - 1].order[orderType] : 0;
                                draft.data.splice(index, 1);
                                if(!additionalFilters){
                                    reorderTasks(draft.data, orderType, baseOrder);
                                }
                            }
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),

        completeTask: builder.mutation({
            query: ({ taskId }) => ({
                url: `${TASKS_URL}/complete/${taskId}`,
                method: 'POST'
            }),
            invalidatesTags: [{ type: 'Task', id: 'LIST' }],
            async onQueryStarted({ taskId, orderType, filters = {}, additionalFilters = false }, { dispatch, queryFulfilled } ) {
                const patchResult = dispatch(
                    tasksApiSlice.util.updateQueryData('getTaskList', filters, (draft) => {
                        let tasks = draft.data;
                        if(Array.isArray(tasks)) {
                            const taskIndex = tasks.findIndex((t) => t._id === taskId);
                            if(taskIndex !== -1){
                                const baseOrder = tasks.length ? tasks[tasks.length - 1].order[orderType] : 0;
                                draft.data.splice(taskIndex, 1);
                                if(!additionalFilters) {
                                    reorderTasks(draft.data, orderType, baseOrder);
                                }
                            }
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            }
        }),

        // for add and update we can change the given task if we are getting that object from server
        addTask: builder.mutation({
            query: (data) => ({
                url: TASKS_URL,
                method: 'POST',
                body: data
            }),
            invalidatesTags: [{ type: 'Task', id: 'LIST' }],
            async onQueryStarted({filters = {}, additionalFilters = false}, { dispatch, queryFulfilled }) {
                try {
                    const response = await queryFulfilled;
                    const addedTask = response.data?.data;
                    if(addedTask){
                        const patchResult = dispatch(
                            tasksApiSlice.util.updateQueryData('getTaskList', filters, (draft) => {
                                let tasks = draft.data;
                                if(Array.isArray(tasks)) {
                                    draft.data.unshift(addedTask);
                                }
                            })
                        );
                    }
                } catch {}
            }
        }),

        editTask: builder.mutation({
            query: (data) => ({
                url: `${TASKS_URL}/${data.taskId}`,
                method: 'PATCH',
                body: data
            }),
            invalidatesTags: [{ type: 'Task', id: 'LIST'}],
            async onQueryStarted({taskId, orderType, filters = {}, additionalFilters = false}, { dispatch, queryFulfilled }) {
                try {
                    const response = await queryFulfilled;
                    const patchResult = dispatch(
                        tasksApiSlice.util.updateQueryData('getTaskList', filters, (draft) => {
                            let tasks = draft.data;
                            if(Array.isArray(tasks)) {
                                const taskIndex = tasks.findIndex((task) => task._id === taskId); 
                                if(taskIndex !== -1){
                                    const updatedTask = response.data?.data;
                                    if(updatedTask){
                                        draft.data[taskIndex] = updatedTask;
                                    } else {
                                        const baseOrder = tasks.length ? tasks[tasks.length - 1].order[orderType] : 0;
                                        draft.data.splice(taskIndex, 1);
                                        if(!additionalFilters){
                                            reorderTasks(draft.data, orderType, baseOrder);
                                        }
                                    }
                                }
                            }
                        }),
                    );   
                } catch {}
            }
        })
        
    }),
});

export const { useGetTaskListQuery, useReorderTaskListMutation, useDeleteTaskMutation, useCompleteTaskMutation, useAddTaskMutation, useEditTaskMutation } = tasksApiSlice;