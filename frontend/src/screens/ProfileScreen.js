import { useEffect, useState } from 'react'
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomToast from 'components/CustomToast';
import { useUpdateUserMutation } from 'slices/userSlice';
import { setCredentials } from 'slices/authSlice';

const ProfileScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [updateUser, {isLoading}] = useUpdateUserMutation();

  const [username, setUsername] = useState(userInfo.username);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    if(password && password !== confirmPassword){
      toast.error(CustomToast("Passwords do not match."));
      return;
    }
    try {
      const response = await updateUser({_id: userInfo._id, username, email, password, confirmPassword}).unwrap();
      dispatch(setCredentials({...response}));
      toast.success(CustomToast('Profile Updated.'));
    } catch (error) {
      toast.error(CustomToast(error?.data?.message || error?.error));
      if(error?.data?.errors) {
        setValidationErrors(error.data.errors)
      }
    }
  }

  useEffect(() => {
    setUsername(userInfo.username);
    setEmail(userInfo.email);
  }, [userInfo.username, userInfo.email])

  return (
    // just simple profile edit form will do for now...
    <MDBox pt={4} pb={3} px={3}>
      <MDBox component="form" role="form" onSubmit={handleUpdateProfile}>
        <MDBox mb={2}>
          <MDInput type="text" label="Username" fullWidth value={username} onChange={(e) => setUsername(e.target.value)} error={validationErrors.username && true} />
          <MDTypography color='error' variant="caption">{validationErrors.username}</MDTypography>
        </MDBox>
        <MDBox mb={2}>
          <MDInput type="email" label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} error={validationErrors.email && true} />
          <MDTypography color='error' variant="caption">{validationErrors.email}</MDTypography>
        </MDBox>
        <MDBox mb={2}>
          <MDInput type="password" label="Password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} error={validationErrors.password && true} />
          <MDTypography color='error' variant="caption">{validationErrors.password}</MDTypography>
        </MDBox>
        <MDBox mb={2}>
          <MDInput type="password" label="Confirm Password" fullWidth value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={validationErrors.confirmPassword && true} />
          <MDTypography color='error' variant="caption">{validationErrors.confirmPassword}</MDTypography>
        </MDBox>
        <MDBox mt={4} mb={1}>
          <MDButton variant="gradient" color="info" type="submit" disabled={isLoading}>
            Update
          </MDButton>
        </MDBox>
      </MDBox>
    </MDBox>
  )
}

export default ProfileScreen