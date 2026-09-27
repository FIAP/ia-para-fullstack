import { criarApp } from "./app.js";
import { config } from "./config.js";

criarApp().listen(config.porta, () => console.log(`API em http://localhost:${config.porta}`));
