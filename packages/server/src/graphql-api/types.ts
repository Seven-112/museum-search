import { Client } from "elasticsearch";

export interface IResolverContext {
  esClient: Client;
}
