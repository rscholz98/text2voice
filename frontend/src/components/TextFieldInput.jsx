/** @format */

import React, { useState } from "react";
import { Textarea, Grid, Button, Typography, LinearProgress } from "@mui/joy";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";

const TextFieldInput = ({ text, setText, onClear }) => {
 const [isUploading, setIsUploading] = useState(false);

 const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  setIsUploading(true);

  try {
   const formData = new FormData();
   formData.append("file", file);

   const response = await fetch("http://127.0.0.1:8000/read-pdf/", {
    method: "POST",
    body: formData,
   });

   if (response.ok) {
    const data = await response.json();
    setText(data.text); // Set the extracted text to the TextArea
   } else {
    console.error("Failed to upload file");
   }
  } catch (error) {
   console.error("Error uploading file:", error);
  } finally {
   setIsUploading(false);
  }
 };

 return (
  <Grid
   container
   spacing={2}
   sx={{
    borderRadius: "md",
   }}
  >
   {/* Toolbar Section */}
   <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
    <Button variant="solid" size="sm" startDecorator={<UploadFileIcon />} component="label">
     Upload File
     <input type="file" hidden accept="application/pdf" onChange={handleFileUpload} />
    </Button>
   </Grid>

   {/* Text Input Area */}
   <Grid item xs={12}>
    <Textarea
     placeholder="Enter your text here..."
     value={text}
     onChange={(e) => setText(e.target.value)}
     minRows={24}
     maxRows={24}
     sx={{ width: "100%", border: "none", outline: "none" }}
    />
   </Grid>

   {/* Footer Section */}
   <Grid
    item
    xs={12}
    sx={{
     display: "flex",
     justifyContent: "space-between",
     alignItems: "center",
     marginTop: -1,
     marginBottom: -1,
    }}
   >
    <Typography level="body2">{text.length} / 500,000 chars</Typography>
    <Button size="sm" variant="plain" onClick={onClear} startDecorator={<DeleteIcon />}>
     Clear Text
    </Button>
   </Grid>

   {/* Progress Bar */}
   {isUploading && (
    <Grid item xs={12}>
     <LinearProgress />
    </Grid>
   )}
  </Grid>
 );
};

export default TextFieldInput;
