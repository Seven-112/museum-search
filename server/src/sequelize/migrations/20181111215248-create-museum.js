"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Museums", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      legalName: {
        type: Sequelize.STRING
      },
      alternateName: {
        type: Sequelize.STRING
      },
      museumType: {
        type: Sequelize.STRING
      },
      institutionName: {
        type: Sequelize.STRING
      },
      streetAddressAdministrative: {
        type: Sequelize.STRING
      },
      cityAdministrative: {
        type: Sequelize.STRING
      },
      stateAdministrative: {
        type: Sequelize.STRING
      },
      zipCodeAdministrative: {
        type: Sequelize.STRING
      },
      streetAddressPhysical: {
        type: Sequelize.STRING
      },
      cityPhysical: {
        type: Sequelize.STRING
      },
      statePhysical: {
        type: Sequelize.STRING
      },
      zipCodePhysical: {
        type: Sequelize.STRING
      },
      phoneNumber: {
        type: Sequelize.STRING
      },
      latitude: {
        type: Sequelize.INTEGER
      },
      longitude: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: queryInterface => {
    return queryInterface.dropTable("Museums");
  }
};
