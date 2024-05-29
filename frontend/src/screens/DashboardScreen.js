import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGetTaskListQuery } from "slices/taskSlice";
import TaskListComponent from "components/TaskListComponent";
import CustomToast from "components/CustomToast";
import MDBox from "components/MDBox";

function Dashboard() {
  const {data, isLoading, isError, error, refetch} = useGetTaskListQuery();
  const taskList = data ? data.data : null;

  useEffect(() => {  
    const fetchTasks = async () => {
        try {
            await refetch();
        } catch (error) {
            toast.error(error?.data?.message || error?.error);
        }
    };

    fetchTasks();
  }, []);


  return (
    <MDBox py={3}>
      <TaskListComponent
        isLoading={isLoading} 
        taskList={taskList} 
        // onEdit={handleTaskEdit} 
        // onDelete={handleTaskDelete}
        // onComplete={handleTaskComplete}
        // onReorder={handleReorder}
      />
    </MDBox>
  );
}

export default Dashboard;
