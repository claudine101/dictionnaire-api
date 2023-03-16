const { query } = require("../utils/db");

class Validation {
          constructor(data, validation, customMessages) {
                    this.data = data;
                    this.validation = validation;
                    this.customMessages = customMessages;
                    this.errors = {};
          }
          /**
           * Check if passed data are valid
           *
           * @returns Boolean
           */
          async isValidate() {
                    const errors = await this.getErrors()
                    return (
                              Object.keys(errors).length === 0 &&
                              errors.constructor === Object
                    );
          }

          /**
           * set new message error
           * @param {string} key - message key
           * @param {string} message - that describe the error
           * @returns {void}
           */
          async setError(key, message) {
                    const errors = this.errors[key]
                              ? [...this.errors[key], message]
                              : [message];
                    this.errors = { ...this.errors, [key]: errors };
          }
          /**
           * get message by key
           * @param {string} key - the message key you want to get
           * @returns {string}
           */
          async getError(key) {
                    await this.run();
                    return this.errors[key];
          }
          /**
           * mark input data as required
           * @param {string} key - the key you want to set as required
           * @param {string} value - the value
           */
          async required(key, value) {
                    try {
                              if (!this.data || !key || !this.data[key] || !value || value === "") {
                                        this.setError(
                                                  key,
                                                  this.customMessages?.[key]?.required || `This field is required`
                                        );
                              }
                    } catch (error) {
                              throw error
                    }
          }

          async length(key, value, params) {
                    if (!value) return;
                    const [min, max] = params;
                    if (min && !max && value.length < min) {
                              this.setError(
                                        key,
                                        this.customMessages?.[key]?.length || `Enter et least ${min} characters`
                              );
                    } else if (!min && max && value.length > max) {
                              this.setError(
                                        key,
                                        this.customMessages?.[key]?.length ||
                                        `You can not exceed ${max} characters`
                              );
                    } else if (min && max && (value.length < min || value.length > max)) {
                              this.setError(
                                        key,
                                        this.customMessages?.[key]?.length ||
                                        `The value of this filed must be between ${min} and ${max}`
                              );
                    }
          }
          async match(key, value, params) {
                    if (!value) return;
                    if (this.data[params] !== value) {
                              this.setError(
                                        key,
                                        this.customMessages?.[key]?.match ||
                                        `Value does not match the ${params} value`
                              );
                    }
          }
          async username(key, value) {
                    if (!value) return;
                    const validUsername = /^[a-zA-Z0-9._]+$/.test(value);
                    if (!validUsername || value?.length < 2) {
                              this.setError(
                                        key,
                                        this.customMessages?.[key]?.username ||
                                        "Incorrect username (letters, numbers, point or underscore)"
                              );
                    }
          }
          async email(key, value) {
                    if (!value) return;
                    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                    if (!validEmail) {
                              this.setError(
                                        key,
                                        this.customMessages?.[key]?.email || "Incorrect email"
                              );
                    }
          }

          async image(key, value, params) {
                    if (!value) return;
                    const IMAGES_MIMES = ["image/jpeg", "image/jpg", "image/gif", "image/png"];
                    if (!IMAGES_MIMES.includes(value.mimetype)) {
                              this.setError(
                                        key,
                                        this.customMessages?.[key]?.image || "Please choose a valid image"
                              );
                    } else if (params < value.size) {
                              const megaBite = (params - 1000000) / 1000000;
                              this.setError(
                                        key,
                                        this.customMessages?.[key]?.size ||
                                        `Your image is too large (max: ${megaBite} MB)`
                              );
                    }
          }
          async exists(key, value, params) {
                    try {
                              if(!value) return
                              const [tableName, columnName] = params.split(',')
                              const row = (await query(`SELECT ${columnName} FROM ${tableName} WHERE ${columnName} = ?`, [value]))[0]
                              if(!row) {
                                        this.setError(
                                                  key,
                                                  this.customMessages?.[key]?.exists ||
                                                  `Row is not exists on ${tableName} table`
                                        );
                              }
                    } catch (error) {
                              throw error
                    }
          }
          async unique(key, value, params) {
                    try {
                              if (!value) return;
                              const [tableName, columnName] = params.split(',')
                              const row = (await query(`SELECT ${columnName} FROM ${tableName} WHERE ${columnName} = ?`, [value]))[0]
                              if(row) {
                                        this.setError(
                                                  key,
                                                  this.customMessages?.[key]?.unique ||
                                                  `The ${columnName} must be unique on ${tableName} table`
                                        );
                              }
                    } catch (error) {
                              throw error
                    }
          }
          /**lm!
           *
           * run the valiton to check for errors
           */
          async run() {
                    for (let key in this.validation) {
                              const value = this.getValue(key);
                              const [properties, params] = this.getProperties(this.validation[key]);
                              try {
                                        await Promise.all(properties.map(async (property) => {
                                                  await this[property](key, value, params?.[property]);
                                        }))
                              } catch (error) {
                                        throw error
                              }
                    }
          }
          /**
           * get all erros
           * @returns {object | {}}
           */
          async getErrors() {
                    return this.errors;
          }

          getProperties(value) {
                    switch (typeof value) {
                              case "string":
                                        return [value.split(","), null];

                              case "object":
                                        const properties = [];
                                        for (let key in value) {
                                                  properties.push(key);
                                        }
                                        return [properties, value];

                              default:
                                        return [value, null];
                    }
          }

          getValue(key) {
                    return this.data && key ? this.data[key] : null
          }
}
module.exports = Validation;
