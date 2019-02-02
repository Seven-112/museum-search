require("dotenv").config();

const COMMON_CONFIG = {
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASS || null,
  host: process.env.DB_HOST || "127.0.0.1",
  dialect: "mysql"
};

/**
 * Sequelize config.
 */
module.exports = {
  development: {
    ...COMMON_CONFIG,
    database: process.env.DB_DATABASE || "database_development"
  },
  test: {
    ...COMMON_CONFIG,
    database: process.env.DB_DATABASE || "database_test"
  },
  production: {
    ...COMMON_CONFIG,
    database: process.env.DB_DATABASE || "database_production"
  }
};
