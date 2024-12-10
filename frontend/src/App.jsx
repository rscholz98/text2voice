/** @format */

import React, { useState, useEffect } from "react";
import { Grid, CssBaseline } from "@mui/joy";
import HeaderSection from "./components/HeaderSection";
import TextFieldInput from "./components/TextFieldInput";
import TTSSettings from "./components/TTSSettings";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
 const [text, setText] = useState("");
 const [audioUrl, setAudioUrl] = useState(null);
 const [models, setModels] = useState([]);
 const [selectedModel, setSelectedModel] = useState("tts_models/de/thorsten/tacotron2-DDC");
 const [cudaAvailable, setCudaAvailable] = useState(false);
 const [modelLoading, setModelLoading] = useState(false);

 useEffect(() => {
  const fetchModels = async () => {
   try {
    const response = await fetch("http://127.0.0.1:8000/list-models/");
    const data = await response.json();
    setModels(data.models);
    toast.success("Models fetched successfully");
    setCudaAvailable(data.cuda_available);
   } catch (error) {
    console.error("Error fetching models:", error);
    toast.error("Error fetching models");
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
    setAudioUrl(null);
    toast.success("Model loaded successfully");
   } else {
    console.error(data.message);
    toast.error("Error loading model");
   }
  } catch (error) {
   console.error("Error loading model:", error);
   toast.error("Error loading model");
  } finally {
   setModelLoading(false);
  }
 };

 const handleGenerateAudio = async ({ language, outputFormat }) => {
  const formData = new FormData();
  formData.append("text", text);
  formData.append("language", language);
  formData.append("output_format", outputFormat);

  try {
   const response = await fetch("http://127.0.0.1:8000/text-to-speech/", {
    method: "POST",
    body: formData,
   });

   if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    setAudioUrl(url);
    toast.success("Audio generated successfully");
   } else {
    toast.error("Error generating audio");
   }
  } catch (error) {
   console.error("Error generating audio:", error);
   toast.error("Error generating audio");
  }
 };

 return (
  <div style={{ height: "100vh", overflow: "hidden" }}>
   <CssBaseline />
   <Grid container sx={{ height: "100%" }}>
    {/* Header Section */}
    <Grid item xs={12}>
     <HeaderSection cudaAvailable={cudaAvailable} />
    </Grid>

    {/* Main Content Section */}
    <Grid container spacing={2} sx={{ flexGrow: 1, padding: 2, height: "calc(100% - 64px)" }}>
     <Grid item xs={9}>
      <TextFieldInput text={text} setText={setText} onClear={() => setText("")} />
     </Grid>

     <Grid item xs={3} sx={{ height: "100%" }}>
      <TTSSettings
       onSubmit={handleGenerateAudio}
       audioUrl={audioUrl}
       models={models}
       selectedModel={selectedModel}
       setSelectedModel={setSelectedModel}
       onLoadModel={handleLoadModel}
       modelLoading={modelLoading}
      />
     </Grid>
    </Grid>
   </Grid>
   <ToastContainer position="bottom-right" autoClose={3000} />
  </div>
 );
}

export default App;
