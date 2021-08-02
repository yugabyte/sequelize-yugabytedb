'use strict';

const Sequelize = require('../source')

async function clearDatabase(sequelize) {
    const qi = sequelize.getQueryInterface();
    await qi.dropAllTables();
    sequelize.modelManager.models = [];
    sequelize.models = {};

    if (qi.dropAllEnums) {
      await qi.dropAllEnums();
    }
    //drop schemas code goes here
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
