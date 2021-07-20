"use strict";


const { Sequelize, Model, Transaction } = require("sequelize");

const PostgresDialect = require("sequelize/lib/dialects/postgres");

//skipLocked is not supported in YugabyteDB
PostgresDialect.prototype.supports.skipLocked = false;

//In findOrCreate() method err.fields is undefined, modifying the existing function code to manage this
//It is because rightnow YugabyteDB doesn't provide "details" for the error, because of which Sequelize can't generate the error properly.
//Corresponding github issue which may resolve this problem: 
Model.findOrCreate = async function findOrCreate(options) {
console.log("OUR FINDORCREATE() FUNCTION!!!!!!!!")
const _ = require('lodash');
const Utils = require('sequelize/lib/utils');
const { logger } = require('sequelize/lib/utils/logger');
const sequelizeErrors = require('sequelize/lib/errors');
if (!options || !options.where || arguments.length > 1) {
    throw new Error(
    'Missing where attribute in the options parameter passed to findOrCreate. ' +
    'Please note that the API has changed, and is now options only (an object with where, defaults keys, transaction etc.)'
    );
}

options = { ...options };

if (options.defaults) {
    const defaults = Object.keys(options.defaults);
    const unknownDefaults = defaults.filter(name => !this.rawAttributes[name]);

    if (unknownDefaults.length) {
    logger.warn(`Unknown attributes (${unknownDefaults}) passed to defaults option of findOrCreate`);
    }
}

if (options.transaction === undefined && this.sequelize.constructor._cls) {
    const t = this.sequelize.constructor._cls.get('transaction');
    if (t) {
    options.transaction = t;
    }
}

const internalTransaction = !options.transaction;
let values;
let transaction;

try {
    const t = await this.sequelize.transaction(options);
    transaction = t;
    options.transaction = t;

    const found = await this.findOne(Utils.defaults({ transaction }, options));
    if (found !== null) {
    return [found, false];
    }

    values = { ...options.defaults };
    if (_.isPlainObject(options.where)) {
    values = Utils.defaults(values, options.where);
    }

    options.exception = true;
    options.returning = true;

    try {
    const created = await this.create(values, options);
    if (created.get(this.primaryKeyAttribute, { raw: true }) === null) {
        // If the query returned an empty result for the primary key, we know that this was actually a unique constraint violation
        throw new sequelizeErrors.UniqueConstraintError();
    }

    return [created, true];
    } catch (err) {
    if (!(err instanceof sequelizeErrors.UniqueConstraintError)) throw err;
    const flattenedWhere = Utils.flattenObjectDeep(options.where);
    const flattenedWhereKeys = Object.keys(flattenedWhere).map(name => _.last(name.split('.')));
    const whereFields = flattenedWhereKeys.map(name => _.get(this.rawAttributes, `${name}.field`, name));
    const defaultFields = options.defaults && Object.keys(options.defaults)
        .filter(name => this.rawAttributes[name])
        .map(name => this.rawAttributes[name].field || name);

    //YugabyteDB related changes are done at this point for errFieldsKeys variable
    const errFieldKeys = [];
    if(err.fields!==undefined) {
        errFieldKeys = Object.keys(err.fields);
    }

    const errFieldsWhereIntersects = Utils.intersects(errFieldKeys, whereFields);
    if (defaultFields && !errFieldsWhereIntersects && Utils.intersects(errFieldKeys, defaultFields)) {
        throw err;
    }

    if (errFieldsWhereIntersects) {
        _.each(err.fields, (value, key) => {
        const name = this.fieldRawAttributesMap[key].fieldName;
        if (value.toString() !== options.where[name].toString()) {
            throw new Error(`${this.name}#findOrCreate: value used for ${name} was not equal for both the find and the create calls, '${options.where[name]}' vs '${value}'`);
        }
        });
    }

    // Someone must have created a matching instance inside the same transaction since we last did a find. Let's find it!
    const otherCreated = await this.findOne(Utils.defaults({
        transaction: internalTransaction ? null : transaction
    }, options));

    // Sanity check, ideally we caught this at the defaultFeilds/err.fields check
    // But if we didn't and instance is null, we will throw
    if (otherCreated === null) throw err;

    return [otherCreated, false];
    }
} finally {
    if (internalTransaction && transaction) {
    await transaction.commit();
    }
}
}

// Commenting out first two isolation levels as they are not currently supported in YugabyteDB
// YugabyteDB only supports SNAPSHOT(REPEATABLE_READ) and SERIALIZABLE transaction isolation levels
Transaction.prototype.ISOLATION_LEVELS = function ISOLATION_LEVELS() {
    return {
        REPEATABLE_READ: 'REPEATABLE READ',
        SERIALIZABLE: 'SERIALIZABLE'
      };
}

module.exports = Sequelize