import { SignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import { Box, Button, Typography } from "@mui/material";

const linen = "#FFF4E9";
const purple_main = "#8D6B94";
const purple_light = "#B185A7";

export default function SignInPage() {
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{
        backgroundImage: 'url(https://wallpaperset.com/w/full/0/6/c/517269.jpg)',
        backgroundSize: 'contain',
      }}
    >
      <Box mt={10} bgcolor="black" borderRadius="12px" boxShadow="4px 4px 4px black">
        <SignIn />
      </Box>
    </Box>
  );
}
