/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// react-router-dom components
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";
import BasicLayout from "./BasicLayout";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "slices/userSlice";
import { setCredentials } from "slices/authSlice";
import { useState } from "react";
import { toast } from "react-toastify";
import CustomToast from "components/CustomToast";

function RegisterScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [register, {isLoading}] = useRegisterMutation();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

 

  const handleRegister = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    if(password && password !== confirmPassword){
      toast.error(CustomToast("Passwords do not match."));
      return;
    }
    try {
      const response = await register({username, email, password, confirmPassword}).unwrap();
      dispatch(setCredentials({...response}));
      navigate('/');
    } catch (error) {
      toast.error(CustomToast(error?.data?.message || error?.error));
      if(error?.data?.errors) {
        setValidationErrors(error.data.errors)
      }
    }

  }

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleRegister}>
            <MDBox mb={2}>
              <MDInput type="text" label="Username" variant="standard" fullWidth value={username} onChange={(e) => setUsername(e.target.value)} error={validationErrors.username && true} />
              <MDTypography color='error' variant="caption">{validationErrors.username}</MDTypography>
            </MDBox>
            <MDBox mb={2}>
              <MDInput type="email" label="Email" variant="standard" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} error={validationErrors.email && true} />
              <MDTypography color='error' variant="caption">{validationErrors.email}</MDTypography>
            </MDBox>
            <MDBox mb={2}>
              <MDInput type="password" label="Password" variant="standard" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} error={validationErrors.password && true} />
              <MDTypography color='error' variant="caption">{validationErrors.password}</MDTypography>
            </MDBox>
            <MDBox mb={2}>
              <MDInput type="password" label="Confirm Password" variant="standard" fullWidth value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={validationErrors.confirmPassword && true} />
              <MDTypography color='error' variant="caption">{validationErrors.confirmPassword}</MDTypography>
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;I agree the&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Terms and Conditions
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" type="submit" disabled={isLoading} fullWidth>
                Register
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/login"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default RegisterScreen;
