import { Sequelize, STRING, DOUBLE, Instance } from "sequelize";

export interface MuseumAttributes {
  id?: number;
  name: string;
  legalName?: string;
  alternateName?: string;
  museumType?: string;
  institutionName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
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
      streetAddress: STRING,
      city: STRING,
      state: STRING,
      zipCode: STRING,
      phoneNumber: STRING,
      latitude: DOUBLE,
      longitude: DOUBLE
    },
    {}
  );
  Museum.associate = models => {
    // associations can be defined here
  };
  return Museum;
};
