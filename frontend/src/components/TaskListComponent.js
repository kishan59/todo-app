import { useState } from 'react'
import MDTypography from "components/MDTypography";
import { CalendarMonth, Delete, DragIndicator, Edit, ErrorOutline, Margin } from "@mui/icons-material";
import { Backdrop, Card, CircularProgress, Icon, IconButton } from "@mui/material";
import MDBox from "components/MDBox";
import Checkboxbutton from "components/Checkboxbutton";
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import FormDialog from './FormDialog';
import { useDeleteTaskMutation, useReorderTaskListMutation, useAddTaskMutation } from "slices/taskSlice";
import MDButton from './MDButton';
import { toast } from 'react-toastify';
import CustomToast from './CustomToast';
import dayjs from 'dayjs';


const TaskListComponent = (props) => {
    const { initialFilters = {}, isLoading = false, taskList, reorderType,
            onAdd = false, onEdit = false, onDelete = false, onComplete = false, onReorder = false, currentDate = undefined } = props;

    const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
    const [addTask, { isLoading: isAdding }] = useAddTaskMutation();


    const priority = {low: "primary", medium: "warning", high: "error"}

    const [taskId, setTaskId] = useState('');
    const [editData, setEditData] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [additionalFilters, setAdditionalFilters] = useState({});
    const [dialogType, setDialogType] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [listHover, setListHover] = useState(null); 
    const [isDragging, setIsDragging] = useState(false);
    const [reorderLoading, setReorderLoading] = useState(false);

    const cardStyle = {
    height: "100%",
    pb: isDragging ? 16.7 : 2,
    flex: 1,
    };

    const onDragStart = () => {
        setIsDragging(true);
    };

    const onDragEnd = async (result) => {
    setIsDragging(false);
    if(!result.destination) return;
    setReorderLoading(true);
    const taskOrders = {};
    const reorderTasks = Array.from(taskList);
    const movedTask = reorderTasks.splice(result.source.index, 1)[0];
    setTaskId(movedTask._id);
    reorderTasks.splice(result.destination.index, 0, movedTask);
    reorderTasks.forEach((task, index) => {
        taskOrders[task._id] = index + 1;
    });
    await handleReorder(taskOrders);
    setReorderLoading(false);
    }
    
    
    const handleDialogOpen = (type, data = {}) => {
        setEditData(data);
        setDialogType(type);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setTaskId('');
        setEditData({});
        setDialogType('');
    };

    const handleFormSubmit = (formData) => {
        if(dialogType == 'add'){
            handleTaskAdd(formData);
        }else if(dialogType == 'edit'){
            handleTaskEdit(formData);
        }else if(dialogType == 'delete'){
            handleTaskDelete();
        }
    }


    const handleTaskAdd = async (formData) => {
        try {
            const result = await addTask({...formData, initialFilters, additionalFilters}).unwrap();
            toast.success(CustomToast(result?.message));
        } catch (error) {
            toast.error(CustomToast(error?.data?.message || error?.error));
            if(error?.data?.errors) {
                setValidationErrors(error.data.errors)
            }
        } finally {
            handleDialogClose();
        }

    }
 

    const handleTaskEdit = async (formData) => {
    console.log("check=========> edit", taskId)
    }


    const handleTaskDelete = async () => {
        try {
            const result = await deleteTask({taskId, orderType: reorderType, initialFilters, additionalFilters}).unwrap();       // if filter is not empty object then we should have "undefined" as value otherwise its ok
            toast.success(CustomToast(result?.message));
        } catch (error) {
            toast.error(CustomToast(error?.data?.message || error?.error));
        } finally {
            handleDialogClose();
        }
    }


    const handleTaskComplete = () => {
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
    try {
        // const reorderTaskList = await useReorderTaskListMutation({_id: taskId, type: reorderType, taskOrders}).unwrap();
    } catch (error) {
        toast.error(CustomToast(error?.data?.message || error?.error));
    } finally {
        setTaskId('');
    }

    // _id: taskId
    // type: 'dayOrder'
    // taskOrders
    }


  


    // also add the backdrop ui as well so whenever edit or add or delete or reorder is happening pass the backdrop loader from dashboard....

    // also need filters but it should be come from parent screen like my projects or today etc...
    return (
    <>
        <FormDialog 
            open={openDialog}
            handleClose={handleDialogClose}
            handleFormSubmit={handleFormSubmit}
            dialogType={dialogType}
            priority={priority}
            editData={editData}
        />
        {onAdd && 
            <MDBox mb={4}>
                <MDButton variant="gradient" color="info" onClick={() => handleDialogOpen('add')}><Icon>add</Icon>&nbsp; Add Task</MDButton>
            </MDBox>
        }
        <MDBox display="flex" flexDirection="column" p={0} m={0}>
            {isLoading ? 
                <MDBox display="flex" justifyContent="center" p={2}>
                    <CircularProgress />
                </MDBox>
            : taskList ? 
                (taskList.length != 0 ?
                    <Card sx={cardStyle}>
                        <Backdrop
                            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                            open={isDeleting || isAdding}
                        >
                            <CircularProgress color="inherit" />
                        </Backdrop>
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
                                                            {onComplete && <Checkboxbutton check={task.status} color={priority[task.priority]} onClick={() => handleTaskComplete(task._id)} />}
                                                            <MDBox>
                                                                <MDTypography variant="body1">{task.title}</MDTypography>
                                                                <MDTypography variant="subtitle2" color="text">
                                                                    {task.description}
                                                                </MDTypography>
                                                                <MDBox display="flex" alignItems="center" gap={1} color={dayjs(task.due_date).format('YYYY-MM-DD') < dayjs(currentDate).format('YYYY-MM-DD') ? 'error' : ''}>
                                                                    <CalendarMonth /> <MDTypography variant="body2" color="inherit">{dayjs(task.due_date).format('Do MMM')}</MDTypography>                  
                                                                </MDBox>
                                                            </MDBox>
                                                            <MDBox ml={'auto'} className={'myText'} color="secondary" sx={{visibility: listHover == task._id ? 'visible' : 'hidden'}}>
                                                                {onEdit && <IconButton color="inherit" onClick={() => {setTaskId(task._id); handleDialogOpen('edit', task)}}><Edit /></IconButton>}
                                                                {onDelete && <IconButton color="inherit" onClick={() => {setTaskId(task._id); handleDialogOpen('delete')}}><Delete /></IconButton>}
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
                : 
                    <MDBox display="flex" alignItems="center" flexDirection="column">
                        <MDBox sx={{fontSize: 150}} display="flex" color="secondary"><ErrorOutline fontSize='inherit'  /></MDBox>
                        <MDTypography variant="body1">No task found!</MDTypography>
                    </MDBox>
                )
            : null}
        </MDBox>
    </>
    )
}

export default TaskListComponent