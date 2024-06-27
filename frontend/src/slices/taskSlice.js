import { apiSlice } from "./apiSlice";

const TASKS_URL = '/api/tasks';

const reorderTasks = (tasks, type, baseOrder) => {
    for(let i = tasks.length -1; i >= 0; i--){
        tasks[i].order[type] = baseOrder + (tasks.length - 1 - i);
    }
    return tasks;
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
        }),

        
        // ************* MOST IMPORTANT *************** if filter is applied then we will disable reordering...
        reorderTaskList: builder.mutation({
            query: (data) => ({
                url: `${TASKS_URL}/reorder`,
                method: 'POST',
                body: data
            }),
            invalidatesTags: [{ type: 'Task', id: 'LIST' }],
            // here same thing as delete api but we rearrange the draft (tasklist) first and then call the reorder function to change the values accordingly
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
                            console.log("check==========>", reorderedData)
                            tasks = reorderedData;          // check why it's not reordering properly our global state
                            tasks = reorderTasks(tasks, orderType, baseOrder);
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
                                tasks.splice(index, 1);
                                if(!additionalFilters){
                                    tasks = reorderTasks(tasks, orderType, baseOrder);
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
        // for completed task api above deleteTask approach is ok

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
                                tasks.splice(taskIndex, 1);
                                if(!additionalFilters) {
                                    tasks = reorderTasks(tasks, orderType, baseOrder);
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
                                    tasks.unshift(addedTask);
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
                                        tasks[taskIndex] = updatedTask;
                                    } else {
                                        const baseOrder = tasks.length ? tasks[tasks.length - 1].order[orderType] : 0;
                                        tasks.splice(taskIndex, 1);
                                        if(!additionalFilters){
                                            tasks = reorderTasks(tasks, orderType, baseOrder);
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