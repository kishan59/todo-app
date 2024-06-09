import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions } from '@mui/material';
import React, { useEffect, useState } from 'react'
import MDButton from './MDButton';
import MDTypography from './MDTypography';
import { useMaterialUIController } from 'context';
import MDInput from './MDInput';
import { Autocomplete, Card, CircularProgress, FormControl, Icon, IconButton, InputLabel, MenuItem, Select, Grid } from "@mui/material";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const FormDialog = (props) => {
    const { open, handleClose, handleFormSubmit, priority, dialogType, editData } = props;
    const [controller, ] = useMaterialUIController();
    const { darkMode } = controller;

    const [formData, setFormData] = useState(editData);

    useEffect(() => {
        setFormData({});
        if(dialogType == 'edit') {
            // call edit api and use loader also
        }

    }, [dialogType])
    

   

    {/* <Autocomplete
    id="grouped-demo"
    options={options.sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter))}
    groupBy={(option) => option.firstLetter}
    getOptionLabel={(option) => option.title}
    sx={{ width: 300 }}
    renderInput={(params) => <TextField {...params} label="With categories" />}
    /> */}

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                component: 'form',
                onSubmit: (event) => {
                    event.preventDefault();
                    handleFormSubmit(formData);
                },
                sx: {background: ({ palette: { white, background } }) => darkMode ? background.sidenav : white.main}
            }}

            maxWidth={'sm'}
            fullWidth={true}
        >
            <DialogTitle sx={{textTransform: 'capitalize'}}>{dialogType} Task</DialogTitle>
            <DialogContent>
                {
                    dialogType == 'delete' ? 
                        <DialogContentText>Do you really want to delete this task?</DialogContentText>
                    : 
                        (<Grid container spacing={2} height="100%">
                            <Grid item md={12} lg={12}>
                                <MDInput
                                    required
                                    // margin="dense"
                                    id="title"
                                    name="title"
                                    label="Task Name"
                                    type="text"
                                    variant="standard"
                                    value={formData.title || null}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item md={12} lg={12}>
                                <MDInput
                                    // margin="dense"
                                    id="description"
                                    name="description"
                                    label="Description"
                                    type="text"
                                    variant="standard"
                                    value={formData.description || null}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    fullWidth
                                    multiline
                                />
                            </Grid>
                            <Grid item md={6} lg={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DatePicker']}>
                                        <DatePicker 
                                            label="Due Date*" 
                                            format='YYYY/MM/DD' 
                                            value={formData.due_date || null} 
                                            onChange={(newDate) => setFormData({...formData, due_date: newDate})} 
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Grid>
                            <Grid item md={6} lg={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="priority-label">Priority*</InputLabel>
                                    <Select
                                        labelId="priority-label"
                                        id="priority"
                                        value={formData.priority || 'medium'}
                                        label="Priority*"
                                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                        sx={{textTransform: 'capitalize'}}
                                    >
                                        {Object.entries(priority).map(([key, value], idx) => (
                                            <MenuItem value={key} sx={{textTransform: 'capitalize'}}>{key}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item md={12} lg={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="category-label">Project</InputLabel>
                                    <Select
                                        labelId="category-label"
                                        id="category"
                                        value={formData.categoryId || null}
                                        label="Project"
                                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                                        sx={{textTransform: 'capitalize'}}
                                    >
                                        {/* {Object.entries(priority).map(([key, value], idx) => (
                                            <MenuItem value={key} sx={{textTransform: 'capitalize'}}>{key}</MenuItem>
                                        ))} */}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* assigned to field with users share the given categoryId (basically they are on the same project) */}
                                    {/* AND this logged in person needs to be the owner of this project (this functionality is for the category screen) */}

                        </Grid>)              
                }
            </DialogContent>
            <DialogActions>
                <MDButton onClick={handleClose} variant="text" color="secondary">Cancel</MDButton>
                <MDButton type="submit" variant="text" color="success">{dialogType == 'edit' ? 'update' : dialogType}</MDButton>
            </DialogActions>
        </Dialog>
    )
}

export default FormDialog