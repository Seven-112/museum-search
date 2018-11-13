"use strict";

import { Sequelize, STRING, INTEGER, Instance } from "sequelize";

export interface MuseumAttributes {
  id?: number;
  name: string;
  legalName?: string;
  alternateName?: string;
  museumType?: string;
  institutionName?: string;
  streetAddressAdministrative?: string;
  cityAdministrative?: string;
  stateAdministrative?: string;
  zipCodeAdministrative?: string;
  streetAddressPhysical?: string;
  cityPhysical?: string;
  statePhysical?: string;
  zipCodePhysical?: string;
  phoneNumber?: string;
  latitude?: number;
  longitude?: number;
}

export type MuseumInstance = Instance<MuseumAttributes> & MuseumAttributes;

export const museumFactory = (sequelize: Sequelize) => {
  const Museum = sequelize.define<MuseumInstance, MuseumAttributes>(
    "Museum",
    {
      name: STRING,
      legalName: STRING,
      alternateName: STRING,
      museumType: STRING,
      institutionName: STRING,
      streetAddressAdministrative: STRING,
      cityAdministrative: STRING,
      stateAdministrative: STRING,
      zipCodeAdministrative: STRING,
      streetAddressPhysical: STRING,
      cityPhysical: STRING,
      statePhysical: STRING,
      zipCodePhysical: STRING,
      phoneNumber: STRING,
      latitude: INTEGER,
      longitude: INTEGER
    },
    {}
  );
  Museum.associate = models => {
    // associations can be defined here
  };
  return Museum;
};
