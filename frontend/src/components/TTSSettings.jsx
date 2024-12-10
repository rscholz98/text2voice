/** @format */

import React, { useState } from "react";
import { Grid, Typography, Select, Option, Button, LinearProgress } from "@mui/joy";
import AutoModeIcon from "@mui/icons-material/AutoMode";

const TTSSettings = ({
 onSubmit,
 audioUrl,
 models,
 selectedModel,
 setSelectedModel,
 onLoadModel,
 modelLoading,
}) => {
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [language, setLanguage] = useState("DE");
 const [outputFormat, setOutputFormat] = useState("mp3");

 const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
   await onSubmit({ language, outputFormat });
  } catch (error) {
   console.error("Error generating audio:", error);
  } finally {
   setIsSubmitting(false);
  }
 };

 return (
  <Grid
   container
   spacing={2}
   sx={{
    border: "1px solid",
    borderRadius: "md",
    p: 2,
   }}
  >
   {/* Model Selector */}
   <Grid xs={12}>
    <Typography sx={{ mb: 0.5 }}>Select Model</Typography>

    <Select
     placeholder="Select Model"
     value={selectedModel}
     onChange={(event, newValue) => setSelectedModel(newValue)}
     sx={{ width: "100%" }}
    >
     {models.map((model) => (
      <Option key={model} value={model}>
       {model}
      </Option>
     ))}
    </Select>
   </Grid>

   <Grid xs={12}>
    <Button
     variant="solid"
     onClick={onLoadModel}
     disabled={!selectedModel || modelLoading}
     startDecorator={<AutoModeIcon />}
    >
     {modelLoading ? "Loading Model..." : "Load Model"}
    </Button>
   </Grid>

   {/* Language Selector */}
   <Grid xs={12}>
    <Typography sx={{ mb: 0.5 }}>Language</Typography>
    <Select value={language} onChange={(e, newValue) => setLanguage(newValue)}>
     <Option value="DE">German (DE)</Option>
     <Option value="EN">English (EN)</Option>
    </Select>
   </Grid>

   {/* Output Format Selector */}
   <Grid xs={12}>
    <Typography sx={{ mb: 0.5 }}>Output File Format</Typography>
    <Select value={outputFormat} onChange={(e, newValue) => setOutputFormat(newValue)}>
     <Option value="mp3">MP3</Option>
     <Option value="wav">WAV</Option>
    </Select>
   </Grid>

   {/* Submit Button */}
   <Grid xs={12} sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
    <Button variant="outlined" onClick={() => (setLanguage("DE"), setOutputFormat("mp3"))}>
     Reset to Default
    </Button>
    <Button variant="solid" onClick={handleSubmit} disabled={isSubmitting}>
     Convert to Speech
    </Button>
   </Grid>

   {/* Progress Bar */}
   {isSubmitting && (
    <Grid xs={12} sx={{ mt: 2 }}>
     <Typography level="body2" sx={{ mb: 0.5 }}>
      Converting...
     </Typography>
     <LinearProgress />
    </Grid>
   )}

   {/* Audio Output Section */}
   {audioUrl && (
    <Grid xs={12} sx={{ mt: 2 }}>
     <Typography level="h6" sx={{ mb: 1 }}>
      Your Audio:
     </Typography>
     <audio controls src={audioUrl} style={{ width: "100%" }} />
     <Button
      variant="outlined"
      component="a"
      href={audioUrl}
      download={`TTS_${new Date()
       .toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
       })
       .replace(", ", "_")
       .replace(":", "-")}.${outputFormat}`}
      sx={{ mt: 1 }}
     >
      Download Audio
     </Button>
    </Grid>
   )}
  </Grid>
 );
};

export default TTSSettings;
