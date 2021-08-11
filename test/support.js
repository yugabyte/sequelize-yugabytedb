'use strict';

const Sequelize = require('../source/index.js')

async function clearDatabase(sequelize) {
    const qi = sequelize.getQueryInterface();
    await qi.dropAllTables();
    sequelize.modelManager.models = [];
    sequelize.models = {};

    if (qi.dropAllEnums) {
      await qi.dropAllEnums();
    }
    await dropTestSchemas(sequelize);
}

async function dropTestSchemas(sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  if (!queryInterface.queryGenerator._dialect.supports.schemas) {
    return this.sequelize.drop({});
  }

  const schemas = await sequelize.showAllSchemas();
  const schemasPromise = [];
  schemas.forEach(schema => {
    const schemaName = schema.name ? schema.name : schema;
    if (schemaName !== sequelize.config.database) {
      schemasPromise.push(sequelize.dropSchema(schemaName));
    }
  });

  await Promise.all(schemasPromise.map(p => p.catch(e => e)));
}

before(function() {
    this.sequelize = createSequelizeTestInstance();
});

beforeEach(async function() {
  
});

afterEach(async function() {
    await clearDatabase(this.sequelize);
});

function createSequelizeTestInstance() {
    console.log("created sequelize instance")
    return new Sequelize('test_sequelize', 'yugabyte', '', {
      dialect: 'postgres',
      host: 'localhost',
      port: '5433', //using the default host and port of YugabyteDB for sequelize here
      logging: false
    });
}
