import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGetTaskListMutation } from "slices/taskSlice";
import TaskListComponent from "components/TaskListComponent";
import CustomToast from "components/CustomToast";
import MDBox from "components/MDBox";

function Dashboard() {
  const [getTaskList, { isLoading }] = useGetTaskListMutation();

  const [taskList, setTaskList] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
          const tasks = await getTaskList().unwrap();
          setTaskList(tasks.data);
      } catch (error) {
        toast.error(CustomToast(error?.data?.message || error?.error));
      }
    }
    fetchTasks();
  }, [])

  const handleTaskEdit = (taskId) => {
    console.log("check=========> edit", taskId)
  }

  const handleTaskDelete = (taskId) => {
    console.log("check=========> delete", taskId)
  }

  const handleTaskComplete = (taskId) => {
    console.log("check=========> complete", taskId)
  }

  const handleReorder = async (taskOrders = {}) => {
    console.log("check=========> reordering", taskOrders);
    // return new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     console.log("Reordering completed");
    //     resolve(); // Resolve the promise when the action is completed
    //   }, 5000); // Simulating a 1-second delay
    // });
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

export default Dashboard;
