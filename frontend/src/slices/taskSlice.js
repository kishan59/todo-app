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
                url: `${TASKS_URL}/reorder/${data._id}`,
                method: 'POST',
                body: data
            }),
            invalidatesTags: [{ type: 'Task', id: 'LIST' }],
            // here same thing as delete api but we rearrange the draft (tasklist) first and then call the reorder function to change the values accordingly
        
        }),


        // if filter is applied then we won't call reordering common function because api will take care of the order when we change filter values just add/change/remove the given task in delete/add/update
        deleteTask: builder.mutation({
            query: ({ taskId, orderType }) => ({
                url: `${TASKS_URL}/${taskId}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Task', id: 'LIST' }],
            async onQueryStarted({ taskId, orderType }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    apiSlice.util.updateQueryData('getTaskList', undefined, (draft) => {
                        let tasks = draft.data;
                        if(Array.isArray(tasks)) {
                            const index = tasks.findIndex((t) => t._id === taskId);
                            if (index !== -1) {
                                const baseOrder = tasks.length ? tasks[tasks.length - 1].order[orderType] : 0;
                                tasks.splice(index, 1);
                                if(orderType){
                                    tasks = reorderTasks(tasks, orderType, baseOrder);
                                }
                            }
                        }
                    })
                )
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
        // for completed task api above deleteTask approach is ok

        // for add and update we can change the given task if we are getting that object from server
    })
});

export const { useGetTaskListQuery, useReorderTaskListMutation, useDeleteTaskMutation } = tasksApiSlice;



// export const tasksApiSlice = apiSlice.injectEndpoints({
//     endpoints: (builder) => ({
//       addTask: builder.mutation({
//         query: (newTask) => ({
//           url: TASKS_URL,
//           method: 'POST',
//           body: newTask,
//         }),
//         invalidatesTags: ['Task'], // Invalidate cache to refetch task list
//         async onQueryStarted(newTask, { dispatch, queryFulfilled }) {
//           // Optimistic update: Prepend added task to tasks list
//           const patchResult = dispatch(
//             tasksApiSlice.util.updateQueryData('getTaskList', undefined, (draft) => {
//               draft.unshift(newTask);
//               // Optional: Reorder tasks if needed
//             })
//           );
//           try {
//             await queryFulfilled;
//           } catch {
//             patchResult.undo(); // Revert optimistic update if mutation fails
//           }
//         },
//       }),
//     }),
//   });

  

// export const tasksApiSlice = apiSlice.injectEndpoints({
//     endpoints: (builder) => ({
//       updateTask: builder.mutation({
//         query: (updatedTask) => ({
//           url: `${TASKS_URL}/${updatedTask.id}`,
//           method: 'PUT',
//           body: updatedTask,
//         }),
//         invalidatesTags: ['Task'], // Invalidate cache to refetch task list
//         async onQueryStarted(updatedTask, { dispatch, queryFulfilled }) {
//           const patchResult = dispatch(
//             tasksApiSlice.util.updateQueryData('getTaskList', undefined, (draft) => {
//               // Optimistic update: Update task in tasks list
//               const index = draft.findIndex((task) => task.id === updatedTask.id);
//               if (index !== -1) {
//                 draft[index] = updatedTask;
//                 // Optional: Reorder tasks if needed
//               }
//             })
//           );
//           try {
//             await queryFulfilled;
//           } catch {
//             patchResult.undo(); // Revert optimistic update if mutation fails
//           }
//         },
//       }),
//       completeTask: builder.mutation({
//         query: (taskId) => ({
//           url: `${TASKS_URL}/${taskId}/complete`,
//           method: 'PUT',
//         }),
//         invalidatesTags: ['Task'], // Invalidate cache to refetch task list
//         async onQueryStarted(taskId, { dispatch, queryFulfilled }) {
//           // Optimistic update: Update completed status of task in tasks list
//           const patchResult = dispatch(
//             tasksApiSlice.util.updateQueryData('getTaskList', undefined, (draft) => {
//               const index = draft.findIndex((task) => task.id === taskId);
//               if (index !== -1) {
//                 draft[index].completed = true;
//                 // Optional: Reorder tasks if needed
//               }
//             })
//           );
//           try {
//             await queryFulfilled;
//           } catch {
//             patchResult.undo(); // Revert optimistic update if mutation fails
//           }
//         },
//       }),
//       deleteTask: builder.mutation({
//         query: (taskId) => ({
//           url: `${TASKS_URL}/${taskId}`,
//           method: 'DELETE',
//         }),
//         invalidatesTags: ['Task'], // Invalidate cache to refetch task list
//         async onQueryStarted(taskId, { dispatch, queryFulfilled }) {
//           const patchResult = dispatch(
//             tasksApiSlice.util.updateQueryData('getTaskList', undefined, (draft) => {
//               // Optimistic update: Remove task from tasks list
//               return draft.filter((task) => task.id !== taskId);
//               // Optional: Reorder tasks if needed
//             })
//           );
//           try {
//             await queryFulfilled;
//           } catch {
//             patchResult.undo(); // Revert optimistic update if mutation fails
//           }
//         },
//       }),
//     }),
//   });
  