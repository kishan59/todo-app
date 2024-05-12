import { IconButton } from "@mui/material";
import UncheckCircle from "@mui/icons-material/CircleTwoTone";
import CheckCircle from "@mui/icons-material/CheckCircle";

const Checkboxbutton = (props) => {
    const { check, color } = props;
    return <IconButton style={{ alignSelf: 'self-start' }} color={color}>{check ? <CheckCircle /> : <UncheckCircle />}</IconButton>
}

export default Checkboxbutton;