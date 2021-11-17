const chai = require('chai')
const expect = chai.expect
const Support = require('./support.js')
const Sequelize = require('../source/index.js')
const DataTypes = require('../source')

chai.use(require('chai-as-promised'))

describe('# Some Basic Initial tests', function() {
    it('authenticate database connection', async function() {
        await this.sequelize.authenticate();
    })

    it('create few tables', async function() {
        this.User = this.sequelize.define('User', {
            username: DataTypes.STRING,
            secretValue: DataTypes.STRING,
            data: DataTypes.STRING,
          });
          this.Account = this.sequelize.define('Account', {
            accountName: DataTypes.STRING
          });
          this.Student = this.sequelize.define('Student', {
            no: { type: DataTypes.INTEGER, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false }
          });
      
          await this.sequelize.sync({ force: true });
    });

    it('create a table and do bulkCreate() operation', async function() {
        const User = this.sequelize.define('User', {
            username: DataTypes.STRING
        });
        await User.sync({ force: true });
        await User.bulkCreate([{ username: 'bob' }, { username: 'rob' }, {username: 'tom'}, {username: 'foo'}, {username: 'bar'}]);
        const count = await User.count();
        expect(count).to.equal(5);
    }); 
    
    it('create table, do bulkCreate(), findAll()', async function() {
        const User = this.sequelize.define('User', {
            username: DataTypes.STRING
        });
        await User.sync({ force: true });
        await User.bulkCreate([{ username: 'bob' }, { username: 'rob' }, {username: 'tom'}, {username: 'foo'}, {username: 'bar'}]);
        const count = await User.count();
        expect(count).to.equal(5);

        const users = await User.findAll();
        expect(users.length).to.be.equal(5);
    }); 

    it('create table, insert rows, delete rows', async function() {
        const User = this.sequelize.define('User', {
            username: DataTypes.STRING
        });
        await User.sync({ force: true });
        await User.bulkCreate([{ username: 'bob' }, { username: 'rob' }, {username: 'tom'}, {username: 'foo'}, {username: 'bar'}]);
        
        const count = await User.count();
        expect(count).to.equal(5);

        await User.destroy({where: {}});
        const count2 = await User.count();
        expect(count2).to.equal(0);
    });
})

describe('Using findOrCreate() method', () => {
    //Re-enable this test case once this bug is fixed - https://github.com/yugabyte/yugabyte-db/issues/10303
    it.skip('should error correctly when defaults contain a unique key', async function() {
        const User = this.sequelize.define('user', {
            objectId: {
            type: DataTypes.STRING,
            unique: true
            },
            username: {
            type: DataTypes.STRING,
            unique: true
            }
        });

        await User.sync({ force: true });

        await User.create({
            username: 'gottlieb'
        });

        await expect(User.findOrCreate({
            where: {
              objectId: 'asdasdasd'
            },
            defaults: {
              username: 'gottlieb'
            }
          })).rejectedWith(Sequelize.UniqueConstraintError);
    })

    it('should be able to findOrCreate a row with the given data', async function() {
        const User = this.sequelize.define('user', {
            objectId: {
            type: DataTypes.STRING,
            unique: true
            },
            username: {
            type: DataTypes.STRING,
            unique: true
            }
        });

        await User.sync({ force: true });

        await User.create({
            username: 'gottlieb'
        });

        await expect(User.findOrCreate({
            where: {
              objectId: 'asdasdasd'
            },
            defaults: {
              username: 'gottlieb2'
            }
          })).to.be.ok;
    })
})
