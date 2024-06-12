import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGetTaskListQuery } from "slices/taskSlice";
import TaskListComponent from "components/TaskListComponent";
import CustomToast from "components/CustomToast";
import MDBox from "components/MDBox";
import dayjs from "dayjs";

function TodayScreen() {
  const initialFilters = {type: 'today'};
  const {data, isLoading, isError, error, refetch} = useGetTaskListQuery(initialFilters);

  const taskList = data ? data.data : null;

  const reorderType = 'dayOrder';

  useEffect(() => {  
    const fetchTasks = async () => {
        try {
            await refetch();
        } catch (error) {
            toast.error(CustomToast(error?.data?.message || error?.error));
        }
    };

    fetchTasks();
  }, [refetch]);

 

  return (
    <MDBox py={3}>
      <TaskListComponent
        currentDate={dayjs().format('YYYY-MM-DD')}
        isLoading={isLoading} 
        taskList={taskList} 
        onAdd={true}
        onEdit={true} 
        onDelete={true}
        onComplete={true}
        onReorder={true}
        reorderType={reorderType}
        initialFilters={initialFilters}
      />
    </MDBox>
  );
}

export default TodayScreen;
