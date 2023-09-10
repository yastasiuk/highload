const { getCurrencyExchangeRate } = require('./exchange.service');
const { sendEvent } = require('./send-ga-events');


const init = async () => {
    const date = new Date();
    console.log(`${date.toUTCString()} Fetching exchange rates..`);
    const rates = await getCurrencyExchangeRate();
    console.log(`Fetched ${rates.length} exchange rates`)

    const uahRate = rates.find(rate => rate.cc === 'USD');

    if (!uahRate) {
        console.log('UAH rate not found');
        console.table(rates);
        return;
    }

    console.log(`[${date.toUTCString()}] UAH rate: ${uahRate.rate}`);
    await sendEvent([{
        name: 'uah_usd',
        params: {
            rate: uahRate.rate,
            time: date.toUTCString()
        }
    }]);
    // We can send up to 25 events per 1 requests
    // for (let i = 0 ; i < rates.length; i += 25) {
    //     const events = [];
    //     console.log(`Sending first ${i + 25} rates`);
    //     for (let j = i; j < rates.length && j < i + 25; j++) {
    //         events.push({
    //             name: 'exchange_rate',
    //             params: {
    //                 ...rates[j],
    //                 time: date.toUTCString(),
    //             },
    //         })
    //     }
    //     await sendEvent(events)
    // }
}

init();
