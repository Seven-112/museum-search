// tslint:disable-next-line: no-var-requires
require("dotenv").config();

import { buildMuseumsIndex } from "../elasticsearch-sync/buildMuseumsIndex";

buildMuseumsIndex();
