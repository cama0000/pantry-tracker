import { Button, Container, Grid, Typography, Box, IconButton, Stack } from '@mui/material';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { useRouter } from 'next/router';
import GoogleIcon from '@mui/icons-material/Google';
import Image from 'next/image';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';


const Index = () => {
  const router = useRouter();

  const handleGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      router.push('/landing');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Box
        component="header"
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          p: 2,
          boxShadow: 1,
        }}
      >

      <Stack direction={'row'} spacing={2}>
            <div className="text-white text-2xl font-bold">
              PantryPal
            </div>
            <img src="/images/pantry.png" alt="pantry" className="w-8 h-8" />
        </Stack>


      </Box>

      <Container className="flex-grow mt-20">
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              Track items, easier.
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
              Effortlessly track, manage, and organize your pantry items with PantryPal. 
              Sign in to start optimizing your kitchen inventory today!
            </Typography>
            <Box display="flex" justifyContent="center" mb={4}>
              <Button 
                onClick={handleGoogle} 
                variant="contained" 
                color="primary" 
                sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 'bold' }}
              >
                <GoogleIcon sx={{ mr: 1 }} />
                Sign In with Google
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                width: 400,
                height: 400,
                mb: { xs: 4, md: 0 },
                ml: { md: 'auto' },
                mx: { xs: 'auto' },
              }}
            >
              <Image
                src="/images/pantryFruit.jpg"
                alt="Pantry Illustration"
                width={400}
                height={400}
                style={{ objectFit: 'cover' }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Box
        component="footer"
        sx={{
          bgcolor: 'grey.900',
          color: 'grey.300',
          p: 2,
          mt: 'auto',
          textAlign: 'center',
        }}
      >
        <Box display="flex" justifyContent="center" mb={1}>
          <IconButton className='hover:scale-105 duration-200' href="https://www.linkedin.com/in/cameronarmijo000/" target="_blank" color="inherit">
            <LinkedInIcon />
          </IconButton>
          <IconButton className='hover:scale-105 duration-200' href="https://github.com/cama0000" target="_blank" color="inherit">
            <GitHubIcon />
          </IconButton>
          <IconButton className='hover:scale-105 duration-200' href="mailto:acama0000@gmail.com" color="inherit">
            <EmailIcon />
          </IconButton>
        </Box>
        <Typography variant="body2">
          © {new Date().getFullYear()} PantryPal. All rights reserved.
        </Typography>
      </Box>
    </div>
  );
};

export default Index;
