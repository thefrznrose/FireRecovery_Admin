import React from "react";
import PhotoGrid from "./PhotoGrid/PhotoGrid";
import { DataProvider } from "@/public/static/DataContext/DataContext";
// import { DataContextProvider } from "@/public/static/DataContext/DataContext";
// import PhotoGrid from "./Login/photogridCopy";
// import Sidebar from "./PhotoGrid/Sidebar";

export default function IndexComponent() {
  return (
    <DataProvider>
        <PhotoGrid />
    </DataProvider>
  );
}
