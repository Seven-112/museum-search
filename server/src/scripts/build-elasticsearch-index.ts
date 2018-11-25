require("dotenv").config();

import { buildMuseumsIndex } from "../elasticsearch/buildMuseumsIndex";

const onFinish = () => process.exit();
buildMuseumsIndex().then(onFinish, onFinish);
