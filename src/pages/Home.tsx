import { Box, Container, Stack, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';
import logo from '../assets/logo.png';

const brickFall = keyframes`
  0% { opacity: 0; transform: translateY(-200px) rotate(-6deg); }
  65% { opacity: 1; transform: translateY(10px) rotate(0deg); }
  85% { transform: translateY(-4px); }
  100% { transform: translateY(0); }
`;

const slideLeft = keyframes`
  0% { opacity: 0; transform: translateX(-24px); }
  100% { opacity: 1; transform: translateX(0); }
`;

export default function HomePage() {
  const title = 'Energo';
  const letters = Array.from(title);
  const step = 0.25; // seconds between letters
  const baseDelay = 0.3; // initial delay before first letter
  const duration = 1.8; // each letter drop duration (slower, brick-like)
  const taglineDelay = baseDelay + step * (letters.length - 1) + duration + 0.2;

  return (
    <Container maxWidth="md" sx={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Stack spacing={3} alignItems="center" textAlign="center">
        <Box component="img" src={logo} alt="Energo" sx={{ width: { xs: 160, sm: 200, md: 240 }, height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }} />
        <Typography variant="h2" fontWeight={800} sx={{ letterSpacing: '0.06em', display: 'flex', gap: 0.5 }}>
          {letters.map((ch, i) => (
            <Box
              key={i}
              component="span"
              sx={{
                display: 'inline-block',
                animation: `${brickFall} ${duration}s cubic-bezier(0.22, 1, 0.36, 1) both`,
                animationDelay: `${baseDelay + i * step}s`,
              }}
            >
              {ch}
            </Box>
          ))}
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ animation: `${slideLeft} 900ms ease-out both`, animationDelay: `${taglineDelay}s` }}>
          Energía prepago a un solo clic!
        </Typography>
      </Stack>
    </Container>
  );
}