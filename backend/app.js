const express = require('express');
const connectDB = require('./src/db/db');
const User = require('./src/models/User');
const userRouter = require('./src/routers/UserRouter');  

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  

// Routes  
app.use('/api', userRouter);  

// Health check  
app.get('/', (req, res) => {  
  res.json({ message: 'API is running' });  
});  

// Start server  
app.listen(PORT, () => {  
  console.log(`Server running on port ${PORT}`);  
});  

module.exports = app;