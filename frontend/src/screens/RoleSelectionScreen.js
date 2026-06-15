import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography
} from '@mui/material';
import { Agriculture, Storefront } from '@mui/icons-material';

const RoleSelectionScreen = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Typography variant="h3" align="center" color="primary.main" fontWeight={700} gutterBottom>
            KrishiSahayak
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Choose how you want to continue
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={2} alignItems="flex-start">
                    <Agriculture color="primary" sx={{ fontSize: 44 }} />
                    <Typography variant="h5" fontWeight={700}>Farmer Portal</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Access AI farming tools, crop recommendations, disease detection, and market insights.
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                      <Button variant="contained" onClick={() => navigate('/farmer-login')}>
                        Farmer Login
                      </Button>
                      <Button variant="outlined" onClick={() => navigate('/farmer-register')}>
                        Farmer Register
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={2} alignItems="flex-start">
                    <Storefront color="secondary" sx={{ fontSize: 44 }} />
                    <Typography variant="h5" fontWeight={700}>Customer Portal</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Browse produce listings, connect with farmers, and place direct interest requests.
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                      <Button variant="contained" color="secondary" onClick={() => navigate('/customer-login')}>
                        Customer Login
                      </Button>
                      <Button variant="outlined" color="secondary" onClick={() => navigate('/customer-register')}>
                        Customer Register
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default RoleSelectionScreen;
