import { app, server } from './server';
import dotenv from 'dotenv';

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server is running on`);
});
