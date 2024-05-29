import { useState } from 'react'
import MDTypography from "components/MDTypography";
import DateFormatter from "components/DateFormatter";
import { CalendarMonth, Delete, DragIndicator, Edit, Margin } from "@mui/icons-material";
import { Card, CircularProgress, IconButton } from "@mui/material";
import MDBox from "components/MDBox";
import Checkboxbutton from "components/Checkboxbutton";
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';


const TaskListComponent = (props) => {
  const { isLoading = false, backdrop = false, taskList, onEdit, onDelete, onComplete, onReorder } = props;

  const priority = {low: "primary", medium: "warning", high: "error"}
  const today = new Date();
  
  const [listHover, setListHover] = useState(null); 

  const [isDragging, setIsDragging] = useState(false);
  const [reorderLoading, setReorderLoading] = useState(false);

  const onDragStart = () => {
    setIsDragging(true);
  };

  const cardStyle = {
    height: "100%",
    pb: isDragging ? 16.7 : 2,
    flex: 1,
  };

  const onDragEnd = async (result) => {
    setIsDragging(false);
    if(!result.destination) return;
    setReorderLoading(true);
    let taskId = '';
    const taskOrders = {};
    const reorderTasks = Array.from(taskList);
    const movedTask = reorderTasks.splice(result.source.index, 1)[0];
    taskId = movedTask._id;
    reorderTasks.splice(result.destination.index, 0, movedTask);
    reorderTasks.forEach((task, index) => {
        taskOrders[task._id] = index + 1;
    });
    await onReorder(taskId, taskOrders);
    setReorderLoading(false);
  }

  // also add the backdrop ui as well so whenever edit or add or delete or reorder is happening pass the backdrop loader from dashboard....

  return (
    <MDBox display="flex" flexDirection="column" p={0} m={0}>
        {isLoading ? 
            <MDBox display="flex" justifyContent="center" p={2}>
                <CircularProgress />
            </MDBox>
        : taskList ? 
            (taskList.length != 0 ?
                <Card sx={cardStyle}>
                    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
                        <Droppable droppableId='droppable'>
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {taskList.map((task, index) => (
                                        <Draggable key={task._id} draggableId={task._id} index={index} isDragDisabled={reorderLoading}>
                                             {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    sx={{
                                                        ...provided.draggableProps.style,
                                                        padding: 16,
                                                        margin: '4px 0',
                                                        background: snapshot.isDragging ? '#e0e0e0' : '#fff',
                                                        border: '1px solid #ddd',
                                                        borderRadius: 4,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                    }}
                                                >
                                                    <MDBox
                                                        key={task._id}
                                                        display="flex" py={2} mx={2} mb={1} borderBottom={1}
                                                        borderColor={'#f0f2f5'}
                                                        onMouseEnter={() => setListHover(task._id)}
                                                        onMouseLeave={() => setListHover(null)}
                                                        pl={4}
                                                    >
                                                        {onReorder &&
                                                            <div {...provided.dragHandleProps} style={{ marginTop: 5, marginLeft: '-30px', visibility: listHover == task._id ? 'visible' : 'hidden', cursor: 'grab' }}>
                                                            <DragIndicator />
                                                        </div>}
                                                        {onComplete && <Checkboxbutton check={task.status} color={priority[task.priority]} onClick={() => onComplete(task._id)} />}
                                                        <MDBox>
                                                            <MDTypography variant="body1">{task.title}</MDTypography>
                                                            <MDTypography variant="subtitle2" color="text">
                                                                {task.description}
                                                            </MDTypography>
                                                            <MDBox display="flex" alignItems="center" gap={1} color={DateFormatter('yyyy-mm-dd', task.due_date) < DateFormatter('yyyy-mm-dd', today) ? 'error' : ''}>
                                                                <CalendarMonth /> <MDTypography variant="body2" color="inherit">{DateFormatter('day month', task.due_date)}</MDTypography>                  
                                                            </MDBox>
                                                        </MDBox>
                                                        <MDBox ml={'auto'} className={'myText'} color="secondary" sx={{visibility: listHover == task._id ? 'visible' : 'hidden'}}>
                                                            {onEdit && <IconButton color="inherit" onClick={() => onEdit(task._id)}><Edit /></IconButton>}
                                                            {onDelete && <IconButton color="inherit" onClick={() => onDelete(task._id)}><Delete /></IconButton>}
                                                        </MDBox>
                                                    </MDBox>
                                                </div>
                                             )}
                                        </Draggable>
                                    ))}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </Card>
            : <MDBox display="flex" justifyContent="center">
                <MDTypography variant="body1" color="error">No task found!</MDTypography>
            </MDBox>)
        : null}
    </MDBox>
  )
}

export default TaskListComponent