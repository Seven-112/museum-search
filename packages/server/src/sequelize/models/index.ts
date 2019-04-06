import Sequelize from "sequelize";
import { museumFactory } from "./museum";

const env = process.env.NODE_ENV || "development";
// tslint:disable-next-line: no-var-requires
const config = require("../config/config")[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

export const db = {
  Museum: museumFactory(sequelize),
  Sequelize,
  sequelize
};

Object.values(db).forEach((model: any) => {
  if (model.associate) {
    model.associate(db);
  }
});
