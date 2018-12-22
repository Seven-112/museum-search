import { Client } from "elasticsearch";

export interface ResolverContext {
  esClient: Client;
}
