import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGetTaskListQuery } from "slices/taskSlice";
import TaskListComponent from "components/TaskListComponent";
import CustomToast from "components/CustomToast";
import MDBox from "components/MDBox";
import dayjs from "dayjs";

function TodayScreen() {
  const today = dayjs().format('YYYY-MM-DD');
  const [filters, setFilters] = useState({type: 'today', due_date: today});
  const [additionalFilters, setAdditionalFilters] = useState(false);
  // for title serach filter
  // const filters = {
  //   title: new RegExp(searchTitle, 'i') // 'i' makes it case-insensitive
  // };

  const {data, isLoading, isError, error, refetch} = useGetTaskListQuery(filters);

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
      {/* create addition filters here...  */}
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
        filters={filters}
        additionalFilters={additionalFilters}
      />
    </MDBox>
  );
}

export default TodayScreen;
