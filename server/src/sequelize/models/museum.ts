"use strict";

import { Sequelize, DataTypes } from "sequelize";

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
  const Museum = sequelize.define(
    "Museum",
    {
      name: DataTypes.STRING,
      legalName: DataTypes.STRING,
      alternateName: DataTypes.STRING,
      museumType: DataTypes.STRING,
      institutionName: DataTypes.STRING,
      streetAddressAdministrative: DataTypes.STRING,
      cityAdministrative: DataTypes.STRING,
      stateAdministrative: DataTypes.STRING,
      zipCodeAdministrative: DataTypes.STRING,
      streetAddressPhysical: DataTypes.STRING,
      cityPhysical: DataTypes.STRING,
      statePhysical: DataTypes.STRING,
      zipCodePhysical: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      latitude: DataTypes.INTEGER,
      longitude: DataTypes.INTEGER
    },
    {}
  );
  Museum.associate = models => {
    // associations can be defined here
  };
  return Museum;
};
