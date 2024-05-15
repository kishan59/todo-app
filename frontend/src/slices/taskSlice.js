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



// export const tasksApiSlice = apiSlice.injectEndpoints({
//     endpoints: (builder) => ({
//       getTaskList: builder.query({
//         query: () => ({
//           url: TASKS_URL,
//           method: 'GET',
//         }),
//         providesTags: (result) =>
//           result
//             ? [...result.map(({ _id }) => ({ type: 'Task', id: _id })), 'Task']
//             : ['Task'],
//       }),
//       // Other mutations...
//     }),
//   });
  



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
  