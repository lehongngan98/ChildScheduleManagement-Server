const express = require('express');
const cors = require('cors');
const authRouter = require('./routers/authRouter');
const childrenRouter = require('./routers/childrenRouter');
const thoiGianBieuRouter = require('./routers/thoiGianBieuRouter');
const scheduleRouter = require('./routers/scheduleRouter');
const evaluationRouter = require("./routers/evaluationRouter");
const rankingRoutes = require('./routers/rankingRoutes');
const userRoutes = require('./routers/userRoutes');



const connectDB = require('./configs/connectDB');
const errorMiddleHandle = require('./middlewares/errorMiddleWare');

const dotenv = require('dotenv');
const app = express();

dotenv.config();

// app.use(cors({ origin: '*' })); // Cho phép tất cả các nguồn truy cập
app.use(cors());
app.use(express.json());
connectDB();

const PORT = 3000;

app.use('/auth', authRouter);
app.use('/api/children', childrenRouter);
app.use('/api/thoigianbieu', thoiGianBieuRouter);
app.use('/api/schedule', scheduleRouter);
app.use("/api/evaluation", evaluationRouter);
app.use('/api/rankings', rankingRoutes);
app.use('/api/users', userRoutes);

app.use(errorMiddleHandle);

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`Server is running at : http://localhost:${PORT}`);
});