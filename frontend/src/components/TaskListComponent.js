import { useState } from 'react'
import MDTypography from "components/MDTypography";
import { CalendarMonth, Delete, DragIndicator, Edit, ErrorOutline, Margin } from "@mui/icons-material";
import UncheckCircle from "@mui/icons-material/CircleTwoTone";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { Backdrop, Card, CircularProgress, Icon, IconButton } from "@mui/material";
import MDBox from "components/MDBox";
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import FormDialog from './FormDialog';
import { useDeleteTaskMutation, useReorderTaskListMutation, useAddTaskMutation } from "slices/taskSlice";
import MDButton from './MDButton';
import { toast } from 'react-toastify';
import CustomToast from './CustomToast';
import dayjs from 'dayjs';
import { useEditTaskMutation } from 'slices/taskSlice';
import { useCompleteTaskMutation } from 'slices/taskSlice';



const TaskListComponent = (props) => {
    const { filters = {}, additionalFilters = false, isLoading = false, taskList, reorderType,
            onAdd = false, onEdit = false, onDelete = false, onComplete = false, onReorder = false, onPagination = false, onPaginationHandle } = props;

    const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
    const [completeTask, { isLoading: isCompleting }] = useCompleteTaskMutation();
    const [addTask, { isLoading: isAdding }] = useAddTaskMutation();
    const [editTask, { isLoading: isUpdating }] = useEditTaskMutation();
    const [reorderTaskList, { isLoading: isReordering }] = useReorderTaskListMutation();

    const priority = {low: "primary", medium: "warning", high: "error"}

    const [taskId, setTaskId] = useState('');
    const [editData, setEditData] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
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
        const taskOrders = [];
        const reorderTasks = Array.from(taskList);
        const movedTask = reorderTasks.splice(result.source.index, 1)[0];
        reorderTasks.splice(result.destination.index, 0, movedTask);
        reorderTasks.forEach((task, index) => {
            taskOrders[index] = task._id;
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
        setValidationErrors({});
    };

    const handleFormSubmit = (formData) => {
        if(dialogType == 'add'){
            handleTaskAdd(formData);
        }else if(dialogType == 'edit'){
            handleTaskEdit(formData);
        }else if(dialogType == 'delete'){
            handleTaskDelete();
        }else if(dialogType == 'complete'){
            handleTaskComplete();
        }
    }


    const handleTaskAdd = async (formData) => {
        try {
            const result = await addTask({...formData, filters, additionalFilters}).unwrap();
            toast.success(CustomToast(result?.message));  
            handleDialogClose();
        } catch (error) {
            toast.error(CustomToast(error?.data?.message || error?.error));
            if(error?.data?.errors) {
                setValidationErrors(error.data.errors)
            }
        }

    }
 

    const handleTaskEdit = async (formData) => {
        try {
            const result = await editTask({taskId, orderType: reorderType, ...formData, filters, additionalFilters}).unwrap();
            toast.success(CustomToast(result?.message));
            handleDialogClose();
        } catch (error) {
            toast.error(CustomToast(error?.data?.message || error?.error));
            if(error?.data?.errors) {
                setValidationErrors(error.data.errors)
            } 
        }
    }


    const handleTaskDelete = async () => {
        try {
            const result = await deleteTask({taskId, orderType: reorderType, filters, additionalFilters}).unwrap();
            toast.success(CustomToast(result?.message));
        } catch (error) {
            toast.error(CustomToast(error?.data?.message || error?.error));
        } finally {
            handleDialogClose();
        }
    }


    const handleTaskComplete = async () => {
        try {
            const result = await completeTask({taskId, orderType: reorderType, filters, additionalFilters}).unwrap();
            toast.success(CustomToast(result?.message));
        } catch (error) {
            toast.error(CustomToast(error?.data?.message || error?.error));
        } finally {
            handleDialogClose();
        }
    }


    const handleReorder = async (taskOrders = []) => {
        try {
            const result = await reorderTaskList({orderType: reorderType, taskOrders, filters, additionalFilters}).unwrap();
            toast.success(CustomToast(result?.message));
        } catch (error) {
            toast.error(CustomToast(error?.data?.message || error?.error));
        }
    }


    // ************** add pagination (load more button) **************
    return (
    <>
        <FormDialog 
            open={openDialog}
            handleClose={handleDialogClose}
            handleFormSubmit={handleFormSubmit}
            dialogType={dialogType}
            priority={priority}
            editData={editData}
            validationErrors={validationErrors}
        />
        {onAdd && 
            <MDBox mb={4} display="flex" flexDirection="row-reverse">
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
                            open={isDeleting || isCompleting || isAdding || isUpdating || isReordering}
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
                                                            pl={onReorder && !additionalFilters ? 1 : 3}
                                                        >
                                                            {(onReorder && !additionalFilters) &&
                                                                <div {...provided.dragHandleProps} style={{ marginTop: 5, paddingLeft: '-30px', visibility: listHover == task._id ? 'visible' : 'hidden', cursor: 'grab' }}>
                                                                <DragIndicator />
                                                            </div>}
                                                            {onComplete && 
                                                                <IconButton style={{ alignSelf: 'self-start' }} color={priority[task.priority]} 
                                                                    onClick={() => {setTaskId(task._id); handleDialogOpen('complete')}}
                                                                >
                                                                    {task.status ? <CheckCircle /> : <UncheckCircle />}
                                                                </IconButton>
                                                            }
                                                            
                                                            <MDBox>
                                                                <MDTypography variant="body1">{task.title}</MDTypography>
                                                                <MDTypography variant="subtitle2" color="text">
                                                                    {task.description}
                                                                </MDTypography>
                                                                <MDBox display="flex" alignItems="center" gap={1} color={dayjs(task.due_date).format('YYYY-MM-DD') < dayjs().format('YYYY-MM-DD') ? 'error' : ''}>
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

                        {onPagination &&
                            <MDBox mx={'auto'} mt={4}>
                                <MDButton variant="text" color="info" onClick={onPaginationHandle}>
                                    <Icon sx={{marginRight: 1}}>loop</Icon> Load More
                                </MDButton>
                            </MDBox>
                        }
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