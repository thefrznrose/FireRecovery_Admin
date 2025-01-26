// import React from "react";
// import {
//   Button,
//   Divider,
//   Flex,
//   Grid,
//   Paper,
//   RangeSlider,
//   Select,
//   Text,
//   TextInput,
// } from "@mantine/core";
// import GoogleSignInButton from "../Login/GoogleSignInButton";
// import { IconClockHour9, IconLayersIntersect, IconTableImport } from "@tabler/icons-react";
// import { useDataContext } from "@/public/static/DataContext/DataContext";

// export default function Sidebar() {
//   const {
//     session,
//     isGoogleAuthenticated,
//     photos,
//     sortOption,
//     locationFilter,
//     timeRange,
//     startDate,
//     endDate,
//     selectedForTimelapse,
//     filteredPhotos,
//     startMonth,
//     startYear,

//     setStartYear,
//     setStartMonth,
//     setSortOption,
//     setLocationFilter,
//     setTimeRange,
//     setStartDate,
//     setEndDate,
//     handleSelectAll,
//     handleGenerateTimelapse,
//     loadPicker,
//   } = useDataContext(); // Import state and handlers from DataContext
  
//   return (
//     <Grid>
//     <Grid.Col span={2.75}>
//     <Paper
//             withBorder
//             style={{
//               padding: "2rem",
//               boxShadow: "sm",
//               height: "100vh",
//               position: "sticky",
//               top: 0,
//             }}
//           >
//             <Text size="lg" mb="sm" style={{ fontWeight: 500 }}>
//               Filters
//             </Text>
//             <Select
//               label="Start Month"
//               placeholder="Select month"
//               data={[
//                 { value: "1", label: "January" },
//                 { value: "2", label: "February" },
//                 { value: "3", label: "March" },
//                 { value: "4", label: "April" },
//               ]}
//               value={String(startMonth)}
//               onChange={setStartMonth}
//             />
//             <Select
//               label="Start Year"
//               placeholder="Select year"
//               data={[
//                 { value: "2022", label: "2022" },
//                 { value: "2023", label: "2023" },
//               ]}
//               value={String(startYear)}
//               onChange={setStartYear}
//             />
//             <Button onClick={loadPicker}>Load Images</Button>
//           </Paper>
//       <Paper
//         withBorder
//         style={{
//           padding: "2rem",
//           boxShadow: "sm",
//           height: "100vh", // Full viewport height
//           overflowY: "auto", // Enable vertical scrolling
//           position: "sticky", // Keeps sidebar fixed during scroll
//           top: 0,
//           backgroundColor: "#f9f9f9", // Optional: Light background
//         }}
//       >
//         {session && isGoogleAuthenticated ? (
//           <Flex align="center" justify="space-between" gap="md">
//             <GoogleSignInButton />
//             <Button
//               onClick={loadPicker}
//               size="sm"
//               style={{ marginTop: "1rem", marginLeft: "3rem" }}
//               leftSection={<IconTableImport />}
//             >
//               Import Sheet
//             </Button>
//           </Flex>
//         ) : (
//           <>
//             <GoogleSignInButton />
//             <Button
//               onClick={loadPicker}
//               size="sm"
//               style={{ marginTop: "1rem", marginLeft: "3rem" }}
//               leftSection={<IconTableImport />}
//             >
//               Import Sheet
//             </Button>
//           </>
//         )}
//         <Divider my="md" />
//         <Text size="xl" mb="md" style={{ fontWeight: 600 }}>
//           Filters:
//         </Text>
//         <Select
//           label="Sort By:"
//           placeholder="Select sorting"
//           data={[
//             { value: "location-asc", label: "Location (A-Z)" },
//             { value: "location-desc", label: "Location (Z-A)" },
//             { value: "time-asc", label: "Taken Time/Date (Oldest First)" },
//             { value: "time-desc", label: "Taken Time/Date (Newest First)" },
//             { value: "uploader-asc", label: "Uploader Name (A-Z)" },
//             { value: "uploader-desc", label: "Uploader Name (Z-A)" },
//           ]}
//           value={sortOption}
//           onChange={setSortOption}
//         />
//         <Select
//           label="Location:"
//           placeholder="Select location"
//           data={[
//             ...new Set(photos.map((photo) => photo.location)),
//           ].map((location) => ({ value: location, label: location }))}
//           value={locationFilter}
//           onChange={setLocationFilter}
//           style={{ marginBottom: "1rem", marginTop: "1rem" }}
//         />
//         <Flex>
//           <TextInput
//             label="Start Date (mm/dd/yyyy):"
//             placeholder="e.g., 01/01/2024"
//             value={startDate}
//             onChange={(e) => setStartDate(e.currentTarget.value)}
//             style={{ paddingRight: "1rem" }}
//           />
//           <TextInput
//             label="End Date (mm/dd/yyyy):"
//             placeholder="e.g., 31/12/2024"
//             value={endDate}
//             onChange={(e) => setEndDate(e.currentTarget.value)}
//           />
//         </Flex>
//         <Text size="sm" style={{ marginBottom: "0.5rem", fontWeight: 500, marginTop: "1rem" }}>
//           Time of Day:
//         </Text>
//         <RangeSlider
//           style={{ marginTop: "1rem", marginBottom: "3rem", marginRight: "1rem", marginLeft: "1rem" }}
//           label={(value) => {
//             const hours = Math.floor(value / 60);
//             const minutes = value % 60;
//             const period = hours < 12 ? "AM" : "PM";
//             const formattedHours = hours % 12 || 12;
//             const formattedMinutes = minutes.toString().padStart(2, "0");
//             return `${formattedHours}:${formattedMinutes} ${period}`;
//           }}
//           marks={[
//             { value: 240, label: "4:00 AM" },
//             { value: 480, label: "8:00 AM" },
//             { value: 720, label: "12:00 PM" },
//             { value: 960, label: "4:00 PM" },
//             { value: 1200, label: "8:00 PM" },
//           ]}
//           min={240}
//           max={1200}
//           step={15}
//           value={timeRange}
//           onChange={setTimeRange}
//         />
//         <Divider my="md" />
//         <Text size="xl" mb="md" style={{ fontWeight: 600 }}>
//           Timelapse Generation:
//         </Text>
//         <Flex>
//           <Button
//             onClick={handleSelectAll}
//             size="xs"
//             fullWidth
//             style={{ marginBottom: "1rem", color: "#fff" }}
//             leftSection={<IconLayersIntersect />}
//           >
//             {selectedForTimelapse.length === filteredPhotos.length
//               ? "Deselect All"
//               : "Select All"}
//           </Button>
//           <Button
//             onClick={handleGenerateTimelapse}
//             size="xs"
//             fullWidth
//             style={{ marginBottom: "1rem", color: "#fff", marginLeft: ".5rem" }}
//             leftSection={<IconClockHour9 />}
//           >
//             Generate MP4
//           </Button>
//         </Flex>
//       </Paper>
//     </Grid.Col>
//     </Grid>
//   );
// }