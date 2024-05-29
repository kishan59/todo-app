import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGetTaskListQuery } from "slices/taskSlice";
import TaskListComponent from "components/TaskListComponent";
import CustomToast from "components/CustomToast";
import MDBox from "components/MDBox";
import { useReorderTaskListMutation } from "slices/taskSlice";
import { useDeleteTaskMutation } from "slices/taskSlice";

function TodayScreen() {
  const {data, isLoading, isError, error, refetch} = useGetTaskListQuery({type: 'today'});
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const taskList = data ? data.data : null;

  const reorderType = 'dayOrder';

  useEffect(() => {  
    const fetchTasks = async () => {
        try {
            await refetch();
        } catch (error) {
            toast.error(error?.data?.message || error?.error);
        }
    };

    fetchTasks();
  }, [refetch]);

  const handleTaskEdit = (taskId) => {
    console.log("check=========> edit", taskId)
  }

  const handleTaskDelete = async (taskId) => {
    console.log("check=========> delete", taskId)
    try {
      const result = await deleteTask({taskId, orderType: reorderType}).unwrap();       // if filter is not empty object then we should have "undefined" as value otherwise its ok
      toast.error(CustomToast(result?.message));
    } catch (error) {
      console.error(error)
      toast.error(CustomToast(error?.data?.message || error?.error));
    }
  }

  const handleTaskComplete = (taskId) => {
    console.log("check=========> complete", taskId)
  }

  const handleReorder = async (taskId, taskOrders = {}) => {
    console.log("check=========> reordering", taskOrders);
    // return new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     console.log("Reordering completed");
    //     resolve(); // Resolve the promise when the action is completed
    //   }, 5000); // Simulating a 1-second delay
    // });
    try {
      const reorderTaskList = await useReorderTaskListMutation({_id: taskId, type: reorderType, taskOrders}).unwrap();
    } catch (error) {
      toast.error(CustomToast(error?.data?.message || error?.error));
    }

    // _id: taskId
    // type: 'dayOrder'
    // taskOrders
  }


  return (
    <MDBox py={3}>
      <TaskListComponent
        isLoading={isLoading} 
        taskList={taskList} 
        onEdit={handleTaskEdit} 
        onDelete={handleTaskDelete}
        onComplete={handleTaskComplete}
        onReorder={handleReorder}
      />
    </MDBox>
  );
}

export default TodayScreen;
