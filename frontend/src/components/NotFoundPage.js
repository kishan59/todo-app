import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {

  const materialUIState = localStorage.getItem('materialUIState') ? JSON.parse(localStorage.getItem('materialUIState')) : null;

  const bgColor = materialUIState?.darkMode ? '#222' : 'whitesmoke';
  const textColor = materialUIState?.darkMode ? '#c9c9c9' : '#222';

  return (
    <Box
      sx={{
        fontFamily: "josefin sans, sans-serif",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: bgColor,
        margin: '-8px'
      }}
    >
      <Box style={{ 
        display: 'flex',
        flexDirection: 'row',
        fontSize: '220px',
        letterSpacing: '10px',
        margin: '0',
        fontWeight: '700',
      }}>
        <Typography variant="span" style={{ color: bgColor, textShadow: `2px 2px 0 ${textColor}, -2px -2px 0 ${textColor}` }}>
          4
          <Typography variant="span" style={{
            textShadow: '2px 2px 0 #ffab00, -2px -2px 0 #ffab00, 0 0 8px #ff8700'
          }}>0</Typography>
          4
        </Typography>
      </Box>
      <Typography variant="span" style={{ color: textColor, fontSize: "16px", fontWeight: 400 }}>
        The page you’re looking for doesn’t exist.
      </Typography>
      <Button LinkComponent={Link} to='/' variant="outlined" style={{marginTop: '16px'}}>Back Home</Button>
    </Box>
  )
}

export default NotFoundPage