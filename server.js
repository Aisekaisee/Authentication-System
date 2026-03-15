import app from "./src/app.js";
import config from "./config";
import connectDB from "./src/config/database.js";

const { PORT } = config;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
