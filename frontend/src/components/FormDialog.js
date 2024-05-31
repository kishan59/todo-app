import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions } from '@mui/material';
import React from 'react'
import MDButton from './MDButton';
import { Icon } from "@mui/material";
import MDTypography from './MDTypography';
import { useMaterialUIController } from 'context';

const FormDialog = (props) => {
    const { open, handleClose, handleFormSubmit, dialogData } = props;
    const [controller, ] = useMaterialUIController();
    const { darkMode } = controller;
    
    return (
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
            <DialogTitle>{dialogData.title || ''}</DialogTitle>
            <DialogContent>
                {dialogData.body || ''}
            </DialogContent>
            <DialogActions>
                <MDButton onClick={handleClose} variant="text" color="secondary">Cancel</MDButton>
                <MDButton type="submit" variant="text" color="success">{dialogData.submitBtn || ''}</MDButton>
            </DialogActions>
        </Dialog>
    )
}

export default FormDialog