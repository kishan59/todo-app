import MDTypography from "./MDTypography";

const CustomToast = (message = '') => {
    return (
        <MDTypography variant="body2" fontWeight="regular">
            {message}
        </MDTypography>
    );
}

export default CustomToast