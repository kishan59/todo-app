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
import dayjs from 'dayjs';
import MDBox from './MDBox';

const FormDialog = (props) => {
    const { open, handleClose, handleFormSubmit, priority, dialogType, editData = {}, validationErrors } = props;
    const [controller, ] = useMaterialUIController();
    const { darkMode } = controller;

    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(editData);
    }, [dialogType, editData]);

    // get categories from slice
    const categories = [
        // { title: 'The Shawshank Redemption', shared_with: ['user1', 'user2'] },
        // { title: 'The Godfather', shared_with: [] },
        // { title: 'The Godfather: Part II', shared_with: ['user1', 'user2'] },
        // { title: 'The Dark Knight', shared_with: [] },
        // { title: '12 Angry Men', shared_with: ['user1', 'user2'] },
        // { title: "Schindler's List", shared_with: null },
        // { title: 'Pulp Fiction', shared_with: ['user1', 'user2'] },
    ];
    const options = categories.map((option) => {
        return {
            projectType: option.shared_with && option.shared_with.length ? 'Shared Projects' : 'My Projects',
            ...option,
        };
    });


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
                    dialogType == 'complete' ? 
                        <DialogContentText>Do you really want mark this task as complete?</DialogContentText>
                    : 
                        (<Grid container spacing={2} height="100%">
                            <Grid item md={12} lg={12}>
                                <MDInput
                                    id="title"
                                    name="title"
                                    label="Task Name"
                                    type="text"
                                    variant="standard"
                                    value={formData.title || null}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    fullWidth
                                    error={validationErrors.title}
                                />
                                    <MDTypography variant={'caption'} color={'error'}>{validationErrors.title}</MDTypography>
                            </Grid>
                            <Grid item md={12} lg={12}>
                                <MDInput
                                    id="description"
                                    name="description"
                                    label="Description"
                                    type="text"
                                    variant="standard"
                                    value={formData.description || null}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    fullWidth
                                    multiline
                                    error={validationErrors.description}
                                />
                                    <MDTypography variant={'caption'} color={'error'}>{validationErrors.description}</MDTypography>
                            </Grid>
                            <Grid item md={6} lg={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DatePicker']}>
                                        <DatePicker 
                                            label="Due Date*" 
                                            format='YYYY-MM-DD' 
                                            value={formData.due_date ? dayjs(formData.due_date) : null} 
                                            onChange={(newValue) => setFormData({...formData, due_date: newValue ? dayjs(newValue).format('YYYY-MM-DD') : null})} 
                                            slotProps={{
                                                textField: {
                                                  error: validationErrors.due_date,
                                                  helperText: validationErrors.due_date,
                                                }
                                            }}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Grid>
                            <Grid item md={6} lg={6}>
                                <MDBox pt={1}>
                                    <MDInput
                                        size="large"
                                        select
                                        labelId="priority-label"
                                        id="priority"
                                        label="Priority*"
                                        InputProps={{
                                            classes: { root: "select-input-styles" },
                                        }}
                                        value={formData.priority || 'medium'}
                                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                        sx={{textTransform: 'capitalize'}}
                                        fullWidth
                                    >
                                        {Object.entries(priority).map(([key, value], idx) => (
                                            <MenuItem value={key} sx={{textTransform: 'capitalize'}}>{key}</MenuItem>
                                        ))}
                                    </MDInput>
                                </MDBox>
                            </Grid>
                            <Grid item md={12} lg={12}>
                                <Autocomplete
                                    id="categories"
                                    options={options.sort((a, b) => (a.projectType === 'My Projects' ? -1 : 1) - (b.projectType === 'My Projects' ? -1 : 1))}
                                    groupBy={(option) => option.projectType}
                                    getOptionLabel={(option) => option.title}
                                    renderInput={(params) => <MDInput {...params} label="Project" />}
                                    noOptionsText="No Projects"
                                />
                            </Grid>

                            {/* assigned_to field with users share the given categoryId (basically they are on the same project) */}
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