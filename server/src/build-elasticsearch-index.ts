import { Client } from "elasticsearch";
import { db } from "./sequelize/models";

require('dotenv').config();

/**
 * Builds the elasticsearch museums index.
 */
const buildMuseumsIndex = async () => {
  const esClient = new Client({
    host: process.env.ES_HOST
  });

  await esClient.ping({});
  console.log("Elasticsearch pinged.");

  // Create museum index if it does not yet exist.
  if (!(await esClient.indices.exists({ index: "museums" }))) {
    await esClient.indices.create({ index: "museums" });
    console.log("museums index created.");
  } else {
    console.log("museums index already exists.");
  }

  await esClient.indices.putMapping({
    index: "museums",
    type: "museum",
    body: {
      museum: {
        properties: {
          location: {
            type: "geo_point"
          }
        }
      }
    }
  });
  console.log("Museum location geo_point mapping created.");

  console.log("Reading museum data from DB.");
  const museums = await db.Museum.findAll().map(data => data.toJSON());
  console.log(`Found ${museums.length} museums in DB`);

  const indexBody: any[] = [];
  museums.forEach(museum => {
    indexBody.push({
      index: { _index: "museums", _type: "museum", _id: museum.id }
    });
    indexBody.push({
      ...museum,
      location: { lat: museum.latitude, lon: museum.longitude }
    });
  });

  console.log("Indexing museum data...");
  await esClient.bulk({
    body: indexBody
  });
  console.log("Museum data indexed.");
};

const onFinish = (input: any) => {
  console.log(input);
  process.exit();
};

buildMuseumsIndex().then(onFinish, onFinish);
