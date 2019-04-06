import { DOUBLE, Instance, Sequelize, STRING } from "sequelize";

export interface IMuseumAttributes {
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

export type MuseumInstance = Instance<IMuseumAttributes> & IMuseumAttributes;

export const museumFactory = (sequelize: Sequelize) => {
  const Museum = sequelize.define<MuseumInstance, IMuseumAttributes>(
    "Museum",
    {
      alternateName: STRING,
      city: STRING,
      institutionName: STRING,
      latitude: DOUBLE,
      legalName: STRING,
      longitude: DOUBLE,
      museumType: STRING,
      name: STRING,
      phoneNumber: STRING,
      state: STRING,
      streetAddress: STRING,
      zipCode: STRING
    },
    {}
  );
  Museum.associate = models => {
    // associations can be defined here
  };
  return Museum;
};
