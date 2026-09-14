// import "dotenv/config";
// import express from "express";
// import { dbClient } from "@db/client.js";
// import { events } from "@db/schema.js";
 
// const app = express();
// app.use(express.json());
 
// app.post("/calendar/events", async (req, res) => {
//   try {
//     const userId = (req as any).user.id;
//     const { title, description, start_time, end_time, priority } = req.body;

//     await dbClient.insert(events).values({
//       userId,
//       title,
//       description: description || null,
//       startTime: new Date(start_time),
//       endTime: end_time ? new Date(end_time) : null,
//       priority: priority ?? 3,
//     });

//     res.status(201).json({ message: "บันทึก Event สำเร็จ!" });
//   } catch (error) {
//     console.error("Error inserting event:", error);
//     res.status(500).json({ error: "ไม่สามารถบันทึกข้อมูลได้" });
//   }
// });
 
// app.get("/calendar/events", async (req, res) => {
//   try {
//     const results = await dbClient.query.events.findMany();
//     res.json(results);
//   } catch (error) {
//     console.error("Error fetching events:", error);
//     res.status(500).json({ error: "ไม่สามารถดึงข้อมูลได้" });
//   }
// });
 
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
 