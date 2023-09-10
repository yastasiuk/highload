const axios = require('axios');

const NBU_EXCHANGE_API = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json'

/**
 * Represents an exchange rate entry.
 * @typedef {Object} ExchangeRateEntry
 * @property {number} r030 - An identifier or code for the currency.
 * @property {string} txt - The full name or description of the currency.
 * @property {number} rate - The exchange rate value.
 * @property {string} cc - The currency code.
 * @property {string} exchangedate - The date of the exchange rate.
 */

/**
 *
 * @returns {Promise<Array<ExchangeRateEntry>>}
 */
const getCurrencyExchangeRate = async () => {
    const response = await axios.get(NBU_EXCHANGE_API);
    return response.data
}

module.exports = {
    getCurrencyExchangeRate,
};
