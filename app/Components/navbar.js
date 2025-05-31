"use client";

import {
  Box,
  AppBar,
  Toolbar,
  Button,
  Dialog,
  Typography,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useState } from "react";
import Image from "next/image";

import logo from "/public/logo.png";

const linen = "#FFF4E9";
const purple_main = "#8D6B94";
const purple_light = "#B185A7";

export default function NavBar() {
  const [dialog, setDialog] = useState(false);
  const [input, setInput] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    setInput(""); // Clear input

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: input }),
      });

      // Handle successful response (if needed)

      if (!res.ok) {
        const err = await res.json();
        setErrorMessage(err.error); // Set error message
        setAlertType('error'); // Set alert type to 'error'
        setOpenAlert(true); // Open the alert
      } else {
        const data = await res;
        setErrorMessage("Professor added successfully!"); // Set success message
        setAlertType('success'); // Set alert type to 'success'
        setOpenAlert(true); // Open the alert
        setDialog(false); // Close the dialog
      }
    } catch (error) {
      console.error("Unexpected Error:", error);
      setErrorMessage(error.message); // Set error message
      setOpenAlert(true); // Open the alert
    }
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ bgcolor: 'black', boxShadow: "2px 2px 2px black" }}>
        <Box display="flex" alignItems="center" flexGrow={1} bgcolor='black'>
          <a href="https://ai-rate-my-professor-lemon.vercel.app">
            <Image alt="Logo" src={logo} width={50} height={50}></Image>
          </a>
        </Box>
        <SignedOut>
          <Button
            sx={{
              border: "1px solid white",
              borderRadius: "10px",
              color: "white",
              bgcolor: "black",
              mx: 1,
              transition: "200ms",
              "&:hover": {
                bgcolor: linen,
                color: 'black',
                transform: "scale(1.05)",
              },
            }}
            href="/signin"
          >
            Sign In
          </Button>
          <Button
            sx={{
              border: "1px solid white",
              borderRadius: "10px",
              color: "white",
              bgcolor: "black",
              mx: 1,
              transition: "200ms",
              "&:hover": {
                bgcolor: linen,
                color: 'black',
                transform: "scale(1.05)",
              },
            }}
            href="/create-account"
          >
            Sign Up
          </Button>
        </SignedOut>
        <SignedIn>
          <Button
            sx={{
              border: "1px solid white",
              borderRadius: "10px",
              color: "white",
              bgcolor: "black",
              mx: 3,
              transition: "200ms",
              "&:hover": {
                bgcolor: linen,
                color: 'black',
                transform: "scale(1.05)",
              },
            }}
            onClick={() => {
              setDialog(true);
            }}
          >
            Add Professor
          </Button>
          <UserButton />
        </SignedIn>
      </Toolbar>

      <Dialog open={dialog} onClose={() => setDialog(false)}>
        <Box
          width={"450px"}
          flexDirection="column"
          alignItems={"center"}
          justifyContent={"center"}
          flex={"display"}
          p={2}
        >
          <Typography align="center" variant="h4">
            Add Professor
          </Typography>
          <Box mt={2} width={"100%"}>
            <TextField
              fullWidth
              label="URL (ratemyprofessor.com)"
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </Box>
          <Box mt={2} width={"100%"} display="flex" justifyContent="flex-end">
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Box>
      </Dialog>
      <Snackbar
        open={openAlert}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
      >
        <Alert onClose={handleCloseAlert} severity={alertType}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </AppBar>
  );
}
