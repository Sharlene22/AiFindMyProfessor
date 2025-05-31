"use client";
import {
  Container,
  Box,
  Stack,
  Dialog,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Item,
  Autocomplete,
} from "@mui/material";
import { useEffect, useState } from "react";
import ProfCard from "./Components/profcard.js";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import "./globals.css";

//Colors
const linen = "#FFF4E9";
const dark_blue = "#6d92b4";
const sky_blue = "#94c5f2";
const light_blue = "#cae2f9";
const galaxy_blue = "#00023d";
const navy_blue = "#000367";

const textfieldTheme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          // declare color root vars to use later
          "--TextField-brandBorderColor": dark_blue,
          "--TextField-brandBorderHoverColor": light_blue,
          "--TextField-brandBorderFocusedColor": light_blue,
          // use color for text color
          "& .MuiInputBase-input": {
            color: "black",
          },
          // color for border, hover, and focus
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "var(--TextField-brandBorderColor)",
            },
            "&:hover fieldset": {
              borderColor: "var(--TextField-brandBorderHoverColor)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "var(--TextField-brandBorderFocusedColor)",
            },
          },
        },
      },
    },
  },
});

export default function Home() {
  const [message, setMessage] = useState("");
  const [professorsJSON, setProfessorsJSON] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState(null);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [ratingError, setRatingError] = useState(false);
  const [numberFilter, setNumberFilter] = useState(null);
  const [numberError, setNumberError] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [schools, setSchools] = useState([]);

  const updateFields = async () => {
    try {
      const response = await fetch("/api/pinecone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "hello" }),
      }).then(async (response) => {
        //console.log("response from client side:", response);
        const data = await response.json();
        //console.log("client metaData:", data);
        setSchools(data.schools);
        setSubjects(data.subjects);
      });
    } catch (error) {
      console.error("error in fetching data: ", error);
    }
  };

  useEffect(() => {
    updateFields();
  }, []);

  const sendMessage = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: { role: "user", content: message },
          // These are the filters for the query. They are hardcoded for now but they should be rendered from the user input.
          filters: {
            ...(schoolFilter && { school: schoolFilter }),
            ...(subjectFilter && { subject: subjectFilter }),
            ...(ratingFilter && { rating: parseFloat(ratingFilter) }),
            ...(numberFilter && { number: parseInt(numberFilter) }),
          },
        }),
      }).then(async (response) => {
        const data = await response.json();
        await setProfessorsJSON(data.professors); // get array of professors from json data
        //console.log("professors:", professorsJSON);
      });
    } catch (er) {
      console.error("error in fetching data: " + er);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingFilter = (e) => {
    const value = e.target.value;

    const numericPattern = /^[0-9]*\.?[0-9]*$/;
    // Check if the value is a valid number and between 1 and 5
    if (
      numericPattern.test(value) &&
      (value === "" || (Number(value) >= 1 && Number(value) <= 5))
    ) {
      // Set the value and remove any error styling
      setRatingFilter(value);
      setRatingError(false);
    } else {
      // Set the error styling if the value is out of range
      setRatingError(true);
    }
  };

  const handleNumberFilter = (e) => {
    const value = e.target.value;

    console.log("value:", value);

    const integerPattern = /^\d+$/; // Matches only whole numbers
    const numericValue = parseInt(value, 10); // Convert to integer

    // Check if the value is a valid number
    if (
      (integerPattern.test(value) && numericValue >= 1 && numericValue <= 10) ||
      value === ""
    ) {
      // Set the value and remove any error styling
      setNumberFilter(value);
      setNumberError(false);
    } else {
      // Set the error styling if the value is out of range
      setNumberError(true);
    }
  };

  const handleSchoolFilter = (event, newValue) => {
    // Only update the state if the newValue is valid
    if (schools.includes(newValue)) {
      setSchoolFilter(newValue);
    } else {
      setSchoolFilter(""); // Optionally clear the input if invalid
    }
  };

  const handleSubjectFilter = (event, newValue) => {
    // Only update the state if the newValue is valid
    if (subjects.includes(newValue)) {
      setSubjectFilter(newValue);
    } else {
      setSubjectFilter(""); // Optionally clear the input if invalid
    }
  };

  const scrollToSearchScreen = (e) => {
    const searchBox = document.getElementById("searchBox");
    searchBox.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Box
      maxHeight="100vh"
      display="flex"
      flexDirection="column"
      bgcolor={linen}
      sx={{
        backgroundImage:
          "url(/prof.jpg)",
        backgroundSize: "contain",
        backgroundPosition: "center center",
      }}
    >
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        // justifyContent="center"
        py={25}
      >
        <Stack
          direction="column"
          spacing={6}
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="h1"
            textAlign="center"
            sx={{
              fontFamily: "BlinkMacSystemFont",
              mb: 3,
              color: "white",
              textShadow: "4px 4px black",
              animation: "entranceTitle 3s ease-out",
            }}
          >
            Find My Professor 
          </Typography>
          <Typography
            variant="h5"
            textAlign="center"
            sx={{
              fontFamily: "BlinkMacSystemFont",
              mb: 3,
              color: "white",
              
              animation: "entranceTitle 3s ease-out",
            }}
          >
            Add RateMyProfessor links for advanced search and personalized AI recommendations.
          </Typography>
          <SignedIn>
            <Stack
              direction="row"
              spacing={3}
              alignItems="center"
              justifyContent="center"
            >
              <Button
                onClick={scrollToSearchScreen}
                sx={{
                  p: 1,
                  fontSize: 20,
                  fontFamily: "BlinkMacSystemFont",
                  mb: 3,
                  color: "white",
                  textShadow: "2px 2px black",
                  boxShadow: "2px 2px black",
                  border: "2px solid white",
                  borderRadius: "50px",
                  animation: "entranceButton 3s ease-out",
                  "&:hover": {
                    transform: "scale(1.1)",
                    bgcolor: linen,
                    color: "black",
                    textShadow: "none",
                  },
                }}
              >
                Get Started
              </Button>
            </Stack>
          </SignedIn>
          <SignedOut>
            <Button
              href="/signin"
              sx={{
                p: 1,
                fontSize: 20,
                fontFamily: "BlinkMacSystemFont",
                mb: 3,
                color: "white",
                textShadow: "2px 2px black",
                boxShadow: "2px 2px black",
                border: "2px solid white",
                borderRadius: "50px",
                animation: "entranceButton 3s ease-out",
                "&:hover": {
                  transform: "scale(1.1)",
                  bgcolor: linen,
                  color: "black",
                  textShadow: "none",
                },
              }}
            >
              Get Started
            </Button>
          </SignedOut>
        </Stack>
      </Box>
      
      <Box
        id="searchBox"
        width="100vw"
        display="flex"
        flexDirection="column"
        alignItems="center"
        p={5}
        flexGrow={1}
        
      >
        <Typography
          variant="h2"
          textAlign="center"
          sx={{
            fontFamily: "BlinkMacSystemFont",
            mt: 8,
            mb: 4,
            color: "white",
            animation: "entranceSearch 3s ease-in",
          }}
        >
          Find The <u>Perfect</u> Professor For You
        </Typography>
        <Stack
          direction="column"
          width="700px"
          border="none"
          borderRadius="10px"
          p={3}
          // spacing={3}
          bgcolor={sky_blue}
          mb={10}
          boxShadow="10px 10px gray"
          sx={{ animation: "entranceTitle 3s ease-out" }}
        >
          <Stack direction="row" alignItems="center" spacing={3} mb={2}>
            <Box bgcolor="white" display="flex" flexGrow={1}>
              <TextField
                multiline
                rows={3}
                placeholder="Please describe the type of professor you are looking for."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                variant="filled"
                color="secondary"
                fullWidth
              />
            </Box>
            <Button
              sx={{
                height: "50px",
                color: "black",
                bgcolor: dark_blue,
                px: 3,
                border: "1px solid black",
                borderRadius: "100px",
                boxShadow: "1px 1px 1px black",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: linen,
                  transform: "scale(1.1)",
                },
              }}
              onClick={sendMessage}
              onChange={(e) => setMessage(e.target.value)}
            >
              Search
            </Button>
          </Stack>
          <Typography
            mb={0}
            textAlign="center"
            sx={{
              textDecoration: "underline",
              fontWeight: "bold",
            }}
          >
            Filters
          </Typography>
          <Grid container>
            <Grid item xs={7} mr={1} mb={1}>
              <Typography>School</Typography>
              <Autocomplete
                options={schools}
                value={schoolFilter || ""}
                onInputChange={handleSchoolFilter}
                renderInput={(params) => (
                  <Box
                    bgcolor="white"
                    border="1px solid black"
                    borderRadius="5px"
                  >
                    <ThemeProvider theme={textfieldTheme}>
                      <TextField
                        {...params}
                        sx={{
                          "& input::placeholder": {
                            color: "black", // Set your desired color here
                          },
                        }}
                        placeholder="Ex. Choose a school from the list"
                        inputMode="text"
                      />
                    </ThemeProvider>
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography>Subject</Typography>
              <Autocomplete
                options={subjects}
                value={subjectFilter || ""}
                onInputChange={handleSubjectFilter}
                renderInput={(params) => (
                  <Box
                    bgcolor="white"
                    border="1px solid black"
                    borderRadius="5px"
                  >
                    <ThemeProvider theme={textfieldTheme}>
                      <TextField
                        {...params}
                        sx={{
                          "& input::placeholder": {
                            color: "black", // Set your desired color here
                          },
                          color: "black",
                        }}
                        placeholder="Ex. Choose a subject from the list"
                        inputMode="text"
                      />
                    </ThemeProvider>
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={5} mr={1}>
              <Typography>Minimum Rating (1-5)</Typography>
              <ThemeProvider theme={textfieldTheme}>
                <Box
                  width="200px"
                  bgcolor="white"
                  border="1px solid black"
                  borderRadius="5px"
                >
                  <TextField
                    error={ratingError}
                    helperText={
                      ratingError
                        ? "Invalid rating. Please enter a number between 1 and 5."
                        : ""
                    } // Optional helper text
                    sx={{
                      "& input::placeholder": {
                        color: "black",
                      },
                    }}
                    placeholder="Ex: 3.6"
                    value={ratingFilter || ""}
                    inputMode={"decimal"}
                    onChange={handleRatingFilter}
                  />
                </Box>
              </ThemeProvider>
            </Grid>
            <Grid item xs={5}>
              <Typography># of results</Typography>
              <ThemeProvider theme={textfieldTheme}>
                <Box
                  width="200px"
                  bgcolor="white"
                  border="1px solid black"
                  borderRadius="5px"
                >
                  <TextField
                    error={numberError}
                    helperText={
                      numberError
                        ? "Invalid number. Please enter a number between 1 and 10."
                        : ""
                    } // Optional helper text
                    sx={{
                      "& input::placeholder": {
                        color: "blkac", // Set your desired color here
                      },
                    }}
                    placeholder="Ex: 3"
                    value={numberFilter || ""}
                    inputMode={"numeric"}
                    onChange={(e) => handleNumberFilter(e)}
                  />
                </Box>
              </ThemeProvider>
            </Grid>
          </Grid>
        </Stack>
        <Box sx={{ position: "relative", height: "100%" }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress size={45} sx={{ color: light_blue }} />
            </Box>
          ) : (
            <Box sx={{ display: loading ? "none" : "block" }}>
              {professorsJSON.map((professor) => (
                <ProfCard
                  key={professor.professor}
                  link={professor.link}
                  name={professor.professor}
                  subject={professor.subject}
                  rating={professor.rating}
                  summary={professor.summary}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
