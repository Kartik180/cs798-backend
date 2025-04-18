const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 5500; // You can change this port if needed

app.use(cors()); // Enable CORS for all routes

// Proxy endpoint
app.get("/proxy", async (req, res) => {
  const rollno = req.query.rollno;
  if (!rollno) {
    return res.status(400).json({ error: "Missing rollno parameter" });
  }
  const targetUrl = `http://172.26.142.68/examscheduler2/personal_schedule.php?rollno=${encodeURIComponent(rollno)}`;
  try {
    const response = await axios.get(targetUrl);
    // Forward the response data and status
    res.status(response.status).send(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data from target", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`CORS proxy server running at http://localhost:${PORT}`);
});




// Connect to MongoDB
mongoose.connect('mongodb+srv://kartik18badmera:5XUZ77ZJh1VR0lNB@cluster0.gpv7xlu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define schemas and models
const resourceSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  type: String, // 'pdf', 'video', 'link', etc.
  dateAdded: { type: Date, default: Date.now }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  instructor: String,
  imageUrl: String,
  resources: [resourceSchema],
  dateCreated: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes for courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// API Routes for resources
app.post('/api/courses/:id/resources', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
        const newCourse = new Course(req.body);
    const savedCourse = await newCourse.save();
    }
    
    course.resources.push(req.body);
    const updatedCourse = await course.save();
    res.status(201).json(updatedCourse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/courses/:courseId/resources/:resourceId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    course.resources.id(req.params.resourceId).remove();
    await course.save();
    res.status(200).json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Existing proxy endpoint
app.get("/proxy", async (req, res) => {
  const rollno = req.query.rollno;
  if (!rollno) {
    return res.status(400).json({ error: "Missing rollno parameter" });
  }
  const targetUrl = `http://172.26.142.68/examscheduler2/personal_schedule.php?rollno=${encodeURIComponent(rollno)}`;
  try {
    const response = await axios.get(targetUrl);
    res.status(response.status).send(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data from target", details: error.message });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});