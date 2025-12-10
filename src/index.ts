import express from 'express';
import cors from 'cors';
import { ENV } from './config/enviroments';
import { createOrderRoutes } from './presentation/routes/orderRoutes';
import { makeOrderRepository } from './infra/database/factories/makeOrderRepository';

const app = express();

app.use(cors())
app.use(express.json());

app.use("/orders", createOrderRoutes(makeOrderRepository()))

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(ENV.PORT, () => {
    console.log(`Server is running on http://localhost:${ENV.PORT}`);
});
