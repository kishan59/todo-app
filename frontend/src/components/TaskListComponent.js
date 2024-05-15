import { useState } from 'react'
import MDTypography from "components/MDTypography";
import DateFormatter from "components/DateFormatter";
import { CalendarMonth, Delete, Edit } from "@mui/icons-material";
import { Card, CircularProgress, IconButton } from "@mui/material";
import MDBox from "components/MDBox";
import Checkboxbutton from "components/Checkboxbutton";


const TaskListComponent = (props) => {
  const { isLoading = false, taskList, onEdit, onDelete, onComplete, onReorder } = props;

  const priority = {low: "primary", medium: "warning", high: "error"}
  const today = new Date();
  
  const [listHover, setListHover] = useState(null); 

  return (
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
                            key={task._id}
                            display="flex" py={2} mx={2} mb={1} borderBottom={1}
                            borderColor={'#f0f2f5'}
                            onMouseEnter={() => setListHover(task._id)}
                            onMouseLeave={() => setListHover(null)}
                        >
                            <Checkboxbutton check={task.status} color={priority[task.priority]} onClick={() => onComplete(task._id)} />
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
                                <IconButton color="inherit" onClick={() => onEdit(task._id)}><Edit /></IconButton>
                                <IconButton color="inherit" onClick={() => onDelete(task._id)}><Delete /></IconButton>
                            </MDBox>
                        </MDBox>
                    ))}
                </Card>
            : <MDBox display="flex" justifyContent="center">
                <MDTypography variant="body1" color="error">No task found!</MDTypography>
            </MDBox>)
        : null}
    </MDBox>
  )
}

export default TaskListComponent