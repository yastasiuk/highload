const axios = require('axios');


const GA_TAG_ID = 'G-W5EG2HNXDK'; // 'UA-77856643-1'; // G-W5EG2HNXDK

const GA_HOST = 'https://www.google-analytics.com';
const SOME_RANDOM_NAME = 'soafgWa3Qzuy4EXIaYu40w';

// https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?client_type=gtag
const sendEvent = async (events) => {
    if (!Array.isArray(events)) {
        console.error('events should be an array');
        return;
    }

    if (events.length > 25) {
        console.warn('You can send up to 25 events. Provided:', events.length);
    }

    await axios.post(`${GA_HOST}/mp/collect`, {
        client_id: 'cronjob',
        events,
    }, {
        params: {
            api_secret: SOME_RANDOM_NAME,
            measurement_id: GA_TAG_ID,
        }
    });
}

module.exports = {
    sendEvent,
};
