/** @format */
import React, { useState } from "react";
import {
 Box,
 Button,
 CssBaseline,
 Drawer,
 AppBar,
 Toolbar,
 Typography,
 TextField,
 IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const drawerWidth = 240;

function App() {
 const [text, setText] = useState("");
 const [audioUrl, setAudioUrl] = useState(null);

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
   <AppBar
    position="fixed"
    sx={{
     width: `calc(100% - ${drawerWidth}px)`,
     ml: `${drawerWidth}px`,
    }}
   >
    <Toolbar>
     <Typography variant="h6" noWrap component="div">
      Text-to-Speech App
     </Typography>
    </Toolbar>
   </AppBar>
   <Drawer
    variant="permanent"
    sx={{
     width: drawerWidth,
     flexShrink: 0,
     [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
    }}
   >
    <Toolbar />
    <Box sx={{ overflow: "auto", padding: 2 }}>
     <Typography variant="h6">Menu</Typography>
     <Typography variant="body2">Home</Typography>
     <Typography variant="body2">About</Typography>
    </Box>
   </Drawer>
   <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}>
    <Toolbar />
    <Typography variant="h4" gutterBottom>
     Convert Text to Speech
    </Typography>
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
    <Button variant="contained" color="primary" onClick={handleGenerateAudio}>
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
   </Box>
  </Box>
 );
}

export default App;
