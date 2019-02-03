require("dotenv").config();

import { buildMuseumsIndex } from "../elasticsearch-sync/buildMuseumsIndex";

buildMuseumsIndex();
