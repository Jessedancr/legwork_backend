import connectMongo from "./core/configs/connectMongo";
import createApp from "./app";

const app = createApp(connectMongo());

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server started on http://localhost:${port}`);
});

export default app;
