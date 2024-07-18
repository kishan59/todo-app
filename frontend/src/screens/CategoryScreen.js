import FormDialog from 'components/FormDialog'
import MDBox from 'components/MDBox'
import { useMaterialUIController } from 'context';
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Grid, Icon, CircularProgress, Autocomplete } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import MDInput from 'components/MDInput';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import { toast } from 'react-toastify';
import CustomToast from 'components/CustomToast';
import { useGetUsersQuery } from 'slices/userSlice';


const CategoryScreen = () => {
    const CATEGORIES_URL = '/fetchApi/api/categories';

    const [controller, ] = useMaterialUIController();
    const { darkMode } = controller;

    const {data, isLoading: usersLoading, refetch} = useGetUsersQuery();
    const usersList = data ? data.data : [];
    // const selectedUsers = useMemo(
    //     () => usersList.filter((v) => v.selected),
    //     [usersList],
    // );
    
    const [open, setOpen] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [formData, setFormData] = useState({});
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                await refetch();
            } catch (error) {
                toast.error(CustomToast(error?.data?.message || error?.error));
            }
        }

        fetchUsers();
    }, [refetch]);


// formData.shared_with get the object of array instead of just array of ids 
        // when trying to autofill incase of editing
    const handleDialogOpen = (type, data = {}) => {
        let shared_with = data.shared_with ? data.shared_with.map(v => v._id) : [];
        data = {...data, shared_with};
        setFormData(data);
        setDialogType(type);
        setOpen(true);
    };

    const handleClose = () => {
        setFormData({});
        setDialogType('');
        setOpen(false);
    }

    const handleFormSubmit = () => {
        if(dialogType == 'add'){
            handleCategoryAdd(formData);
        }else if(dialogType == 'edit'){
            // handleCategoryEdit(formData);
        }else if(dialogType == 'delete'){
            // handleCategoryDelete();
        }
    }

    



    const handleCategoryAdd = async () => {
        let shared_with = formData.shared_with && formData.shared_with.length != [] ? formData.shared_with.map(v => v._id) : null;
        let body = formData;
        body = {...body, shared_with}
        try {
            const response = await fetch(CATEGORIES_URL, 
                {
                    method: "POST", 
                    body: JSON.stringify(body)
                }
            );
            const result = await response.json();
            if (!response.ok) {
                const error = {data: result};       // mimicing the RTK query response where it gives data: {message, data etc...}
                toast.error(CustomToast(error?.data?.message || error?.error));
                if(error?.data?.errors) {
                    setValidationErrors(error.data.errors)
                }
                return;
            }
            toast.success(CustomToast(result?.message));  
            handleClose();
        } catch (error) {
            toast.error(CustomToast(error?.data?.message || error?.error));
        }
    } 

    


  return (
    <MDBox py={3}>
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                component: 'form',
                onSubmit: (event) => {
                    event.preventDefault();
                    handleFormSubmit();
                },
                sx: {background: ({ palette: { white, background } }) => darkMode ? background.sidenav : white.main}
            }}

            maxWidth={'sm'}
            fullWidth={true}
        >
            <DialogTitle sx={{textTransform: 'capitalize'}}>{dialogType} Category</DialogTitle>
            <DialogContent>
                {
                    dialogType == 'delete' ? 
                        <DialogContentText>Do you really want to delete this category?</DialogContentText>
                    : 
                        (<Grid container spacing={2} height="100%" mt={1}>
                            <Grid item md={8} lg={8}>
                                <MDInput
                                    id="name"
                                    name="name"
                                    label="Category Name*"
                                    type="text"
                                    variant="outlined"
                                    value={formData.name || null}
                                    onChange={(e) => setFormData({...formData, name: e.target.value.trim() ? e.target.value : null})}
                                    fullWidth
                                    error={validationErrors.name}
                                />
                                    <MDTypography variant={'caption'} color={'error'}>{validationErrors.name}</MDTypography>
                            </Grid>
                            <Grid item md={4} lg={4}>
                                <MDInput
                                    id="color"
                                    name="color"
                                    label="Category Color"
                                    type="color"
                                    value={formData.color || '#808080'}
                                    onChange={(e) => setFormData({...formData, color: e.target.value.trim() ? e.target.value : null})}
                                    fullWidth
                                    error={validationErrors.color}
                                />
                                    <MDTypography variant={'caption'} color={'error'}>{validationErrors.color}</MDTypography>
                            </Grid>
                            <Grid item md={12} lg={12}>
                                {/* get all users list here */}
                                <Autocomplete
                                    multiple
                                    id="shared_with"
                                    options={usersList}
                                    getOptionLabel={(option) => option.username}
                                    // defaultValue={[top100Films[13]]}
                                    loading={usersLoading}
                                    shared_with
                                    // defaultValue={formData.shared_with || []}
                                    value={formData.shared_with || []}
                                    onChange={(event, newValue) => setFormData({...formData, shared_with: newValue})}
                                    // isOptionEqualToValue={(option, value) => option._id === value._id}
                                    renderInput={(params) => (
                                    <MDInput
                                        {...params}
                                        label="Share With"
                                        placeholder="Users"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                              <>
                                                {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                              </>
                                            ),
                                          }}
                                    />
                                    )}
                                />
                                    <MDTypography variant={'caption'} color={'error'}>{validationErrors.shared_with}</MDTypography>
                            </Grid>
                        </Grid>)              
                }
            </DialogContent>
            <DialogActions>
                <MDButton onClick={handleClose} variant="text" color="secondary">Cancel</MDButton>
                <MDButton type="submit" variant="text" color="success">{dialogType == 'edit' ? 'update' : dialogType}</MDButton>
            </DialogActions>
        </Dialog>

        <MDBox mb={4} display="flex" flexDirection="row-reverse">
            <MDButton variant="gradient" color="info" onClick={() => handleDialogOpen('add')}><Icon>add</Icon>&nbsp; Create Category</MDButton>
        </MDBox>

        {/* here just like task list component list our categories list... */}

    </MDBox>
  )
}

export default CategoryScreen