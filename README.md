# sequelize-yugabytedb

Use the below command to install [sequelize-yugabytedb](https://www.npmjs.com/package/sequelize-yugabytedb) package in your project
```
npm install sequelize-yugabytedb 
```

### Steps to run the tests
1. Make sure you have a YugabyteDB cluster up and running on your machine. <br/>Note: The tests are assuming the `localhost` and `5433` as default host and port for YugabyteDB cluster.
2. Create a database `test_sequelize`:
   ```
   $ ysqlsh -c "CREATE DATABASE test_sequelize"
   ```
3. Install dependencies by running:
   ```
   $ npm install
   ```
4. To run the test, simply do:
   ```
   $ npm test
   ```



We will soon add a link to product documentation for using the package once uploaded in yugabyte docs.

If you encounter any bugs please file it in [sequelize-yugabytedb project](https://github.com/yugabyte/sequelize-yugabytedb/issues/new)

