import { Box, Container, Stack, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';
import logo from '../assets/logo.png';

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
`;
const slideLeft = keyframes`
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: translateX(0); }
`;

export default function HomePage() {
  return (
    <Container maxWidth="md" sx={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Stack spacing={3} alignItems="center" textAlign="center">
        <Box component="img" src={logo} alt="Energo" sx={{ width: { xs: 160, sm: 200, md: 240 }, height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }} />
        <Typography variant="h2" fontWeight={800} sx={{ animation: `${slideDown} 700ms ease-out 100ms both` }}>
          Energo
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ animation: `${slideLeft} 800ms ease-out 300ms both` }}>
          Energía prepago a un solo clic!
        </Typography>
      </Stack>
    </Container>
  );
}