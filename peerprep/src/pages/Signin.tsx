import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';

function Signin() {
  return (
    <React.Fragment>
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
                >
                <Link href="/signup" variant="h4">
                    Sign in
                </Link>
                </Box>
            </Grid>
            </Grid>
    </React.Fragment>
  );
}

export default Signin;