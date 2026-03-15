import app from "./src/app.js";
import config from "./src/config/config.js";
import connectDB from "./src/config/database.js";

const { PORT } = config;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
