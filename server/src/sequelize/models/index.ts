"use strict";

import Sequelize from "sequelize";
import { museumFactory } from "./museum";

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

export const db = {
  sequelize,
  Sequelize,
  Museum: museumFactory(sequelize)
};

Object.values(db).forEach((model: any) => {
  if (model.associate) {
    model.associate(db);
  }
});
