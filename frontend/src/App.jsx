/** @format */

import React, { useState, useEffect } from "react";
import {
 Box,
 Button,
 CssBaseline,
 AppBar,
 Toolbar,
 Typography,
 TextField,
 Select,
 MenuItem,
 FormControl,
 InputLabel,
 CircularProgress,
 IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

function App() {
 const [text, setText] = useState("");
 const [audioUrl, setAudioUrl] = useState(null);
 const [models, setModels] = useState([]);
 const [selectedModel, setSelectedModel] = useState("tts_models/de/thorsten/tacotron2-DDC");
 const [cudaAvailable, setCudaAvailable] = useState(false);
 const [loading, setLoading] = useState(true);
 const [modelLoading, setModelLoading] = useState(false);
 const [loadedModel, setLoadedModel] = useState(null);

 // Fetch available models on load
 useEffect(() => {
  const fetchModels = async () => {
   try {
    const response = await fetch("http://127.0.0.1:8000/list-models/");
    const data = await response.json();
    setModels(data.models);
    setCudaAvailable(data.cuda_available);
   } catch (error) {
    console.error("Error fetching models:", error);
   } finally {
    setLoading(false);
   }
  };
  fetchModels();
 }, []);

 const handleLoadModel = async () => {
  setModelLoading(true);
  try {
   const formData = new FormData();
   formData.append("model_name", selectedModel);
   const response = await fetch("http://127.0.0.1:8000/load-model/", {
    method: "POST",
    body: formData,
   });
   const data = await response.json();
   if (response.ok) {
    setLoadedModel(selectedModel);
    setAudioUrl(null);
   } else {
    console.error(data.message);
   }
  } catch (error) {
   console.error("Error loading model:", error);
  } finally {
   setModelLoading(false);
  }
 };

 const handleGenerateAudio = async () => {
  const formData = new FormData();
  formData.append("text", text);

  try {
   const response = await fetch("http://127.0.0.1:8000/text-to-speech/", {
    method: "POST",
    body: formData,
   });
   if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    setAudioUrl(url);
   } else {
    console.error("Error generating audio");
   }
  } catch (error) {
   console.error("Error in request:", error);
  }
 };

 return (
  <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
   <CssBaseline />
   <AppBar position="static">
    <Toolbar>
     <Typography variant="h6" noWrap component="div">
      Text-to-Speech App
     </Typography>
     <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
      {cudaAvailable ? (
       <Box display="flex" alignItems="center">
        <CheckCircleIcon sx={{ marginRight: 1 }} />
        <Typography>CUDA Available</Typography>
       </Box>
      ) : (
       <Box display="flex" alignItems="center">
        <ErrorIcon sx={{ marginRight: 1 }} />
        <Typography>CUDA Not Available</Typography>
       </Box>
      )}
     </Box>
    </Toolbar>
   </AppBar>

   <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
    {loading ? (
     <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress />
     </Box>
    ) : (
     <>
      <Typography variant="h4" gutterBottom>
       Convert Text to Speech
      </Typography>
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
       <InputLabel>Select Model</InputLabel>
       <Select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        label="Select Model"
       >
        {models.map((model) => (
         <MenuItem value={model} key={model}>
          {model}
         </MenuItem>
        ))}
       </Select>
      </FormControl>

      <Box display="flex" justifyContent="left" alignItems="center">
       <Button
        variant="contained"
        color="secondary"
        onClick={handleLoadModel}
        disabled={!selectedModel || modelLoading}
       >
        {modelLoading ? "Loading Model..." : "Load Model"}
       </Button>
       <Typography variant="body2" sx={{ marginLeft: 2 }}>
        (Loading a new model will take a few minutes to locally cache the model)
       </Typography>
      </Box>

      {loadedModel && (
       <Typography variant="body2" sx={{ marginTop: 2 }}>
        Currently Loaded Model: <strong>{loadedModel}</strong>
       </Typography>
      )}

      <TextField
       label="Enter Text"
       variant="outlined"
       fullWidth
       multiline
       rows={4}
       value={text}
       onChange={(e) => setText(e.target.value)}
       sx={{ marginTop: 3 }}
      />
      <Button
       variant="contained"
       color="primary"
       onClick={handleGenerateAudio}
       disabled={!loadedModel || !text.trim()}
       sx={{ marginTop: 2 }}
      >
       Generate Audio
      </Button>
      {audioUrl && (
       <Box mt={3}>
        <Typography variant="h6">Your Audio:</Typography>
        <audio controls src={audioUrl} />
        <Box mt={2}>
         <Button variant="outlined" component="a" href={audioUrl} download="output.mp3">
          Download Audio
         </Button>
        </Box>
       </Box>
      )}
     </>
    )}
   </Box>
  </Box>
 );
}

export default App;
