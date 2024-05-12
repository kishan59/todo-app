import { CalendarMonth, Delete, Edit, Flag } from "@mui/icons-material";
import { Card, CircularProgress, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid";
import Checkboxbutton from "components/Checkboxbutton";
import CustomToast from "components/CustomToast";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DateFormatter from "components/DateFormatter";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGetTaskListMutation } from "slices/taskSlice";


function Dashboard() {
  const [getTaskList, { isLoading }] = useGetTaskListMutation();

  const [listHover, setListHover] = useState(null); 
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

  const priority = {low: "primary", medium: "warning", high: "error"}
  const today = new Date();

  return (
    <MDBox py={3}>
      {/* create this whole thing as common tasklist component with loadmore functionality */}
      <MDBox display="flex" flexDirection="column" p={0} m={0}>
          {isLoading ? 
            <MDBox display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </MDBox>
          : taskList ? 
            (taskList.length != 0 ?
              <Card sx={{ height: "100%", pb: 2 }}>
                {taskList.map((task, idx) => (
                  <MDBox
                    display="flex" py={2} mx={2} mb={1} borderBottom={1}
                    borderColor={'#f0f2f5'}
                    onMouseEnter={() => setListHover(task._id)}
                    onMouseLeave={() => setListHover(null)}
                  >
                    <Checkboxbutton check={task.status} color={priority[task.priority]} />
                    <MDBox>
                      <MDTypography variant="body1">{task.title}</MDTypography>
                      <MDTypography variant="subtitle2" color="text">
                        {task.description}
                      </MDTypography>
                      <MDBox display="flex" alignItems="center" gap={1} color={DateFormatter('yyyy-mm-dd', task.due_date) < DateFormatter('yyyy-mm-dd', today) ? 'error' : ''}>
                        <CalendarMonth /> <MDTypography variant="body2" color="inherit">{DateFormatter('day month', task.due_date)}</MDTypography>                  
                      </MDBox>
                    </MDBox>
                    <MDBox ml={'auto'} className={'myText'} color="secondary" sx={{display: listHover == task._id ? 'block' : 'none'}}>
                      <IconButton color="inherit"><Edit /></IconButton>
                      <IconButton color="inherit"><Delete /></IconButton>
                    </MDBox>
                  </MDBox>
                ))}
              </Card>
            : <MDBox display="flex" justifyContent="center">
                <MDTypography variant="body1" color="error">No task found!</MDTypography>
            </MDBox>)
          : null}
      </MDBox>
    </MDBox>
  );
}

export default Dashboard;
