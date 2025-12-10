import express from 'express';
import cors from 'cors';
import { ENV } from './config/enviroments';
import { createOrderRoutes } from './presentation/routes/orderRoutes';

const app = express();

app.use(cors())
app.use(express.json());

app.use("/orders", createOrderRoutes())

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(ENV.PORT, () => {
    console.log(`Server is running on http://localhost:${ENV.PORT}`);
});
