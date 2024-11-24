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
 Badge,
 CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

function App() {
 const [text, setText] = useState("");
 const [audioUrl, setAudioUrl] = useState(null);
 const [models, setModels] = useState([]);
 const [selectedModel, setSelectedModel] = useState("");
 const [cudaAvailable, setCudaAvailable] = useState(false);
 const [loading, setLoading] = useState(true);

 // Fetch available models on load
 useEffect(() => {
  const fetchModels = async () => {
   const response = await fetch("http://127.0.0.1:8000/list-models/");
   const data = await response.json();
   setModels(data.models);
   setCudaAvailable(data.cuda_available);
   setLoading(false);
  };
  fetchModels();
 }, []);

 const handleGenerateAudio = async () => {
  const formData = new FormData();
  formData.append("text", text);

  const response = await fetch("http://127.0.0.1:8000/text-to-speech/", {
   method: "POST",
   body: formData,
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  setAudioUrl(url);
 };

 return (
  <Box sx={{ display: "flex" }}>
   <CssBaseline />
   <AppBar position="fixed">
    <Toolbar>
     <Typography variant="h6" noWrap component="div">
      Text-to-Speech App
     </Typography>
     <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
      {cudaAvailable ? (
       <Badge badgeContent="CUDA" color="primary">
        <CheckCircleIcon />
       </Badge>
      ) : (
       <Badge badgeContent="No CUDA" color="error">
        <ErrorIcon />
       </Badge>
      )}
     </Box>
    </Toolbar>
   </AppBar>

   <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}>
    <Toolbar />
    {loading ? (
     <CircularProgress />
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
         <MenuItem value={model.model_name} key={model.model_name}>
          {model.model_name} {model.locally_available ? "(Local)" : "(Needs Download)"}
         </MenuItem>
        ))}
       </Select>
      </FormControl>

      <TextField
       label="Enter Text"
       variant="outlined"
       fullWidth
       multiline
       rows={4}
       value={text}
       onChange={(e) => setText(e.target.value)}
       sx={{ marginBottom: 2 }}
      />
      <Button
       variant="contained"
       color="primary"
       onClick={handleGenerateAudio}
       disabled={!selectedModel}
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
