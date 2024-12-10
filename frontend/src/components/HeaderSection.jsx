/** @format */

import * as React from "react";
import { Grid, IconButton, Typography } from "@mui/joy";
import MapsHomeWorkIcon from "@mui/icons-material/MapsHomeWork";
import ColorSchemeToggle from "./ColorSchemeToggle";

export default function HeaderSection() {
 return (
  <Grid
   container
   alignItems="center"
   justifyContent="space-between"
   sx={{
    width: "100%",
    top: 0,
    px: 1.5,
    py: 1,
    zIndex: 10000,
    backgroundColor: "background.body",
    borderBottom: "1px solid",
    borderColor: "divider",
    position: "sticky",
   }}
  >
   {/* Left Section */}
   <Grid item xs="auto" display="flex" alignItems="center">
    <IconButton size="sm" variant="soft">
     <MapsHomeWorkIcon />
    </IconButton>
    <Typography component="h1" sx={{ fontWeight: "xl", ml: 1 }}>
     Daikon VOX
    </Typography>
   </Grid>

   {/* Right Section */}
   <Grid item xs="auto" display="flex" alignItems="center" gap={2}>
    <ColorSchemeToggle sx={{ alignSelf: "center" }} />
   </Grid>
  </Grid>
 );
}
