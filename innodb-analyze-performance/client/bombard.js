const { getConnection } = require('./client');

function getRandomDateBetween(start, end) {
    // Convert date strings to timestamps
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();

    // Generate a random timestamp between the start and end timestamps
    const randomTimestamp = startDate + Math.random() * (endDate - startDate);

    // Convert the random timestamp back to a date format and return
    return new Date(randomTimestamp).toISOString().split('T')[0];
}

const createUsers = (numberOfUsers) => {
    const users = [];
    for (let i = 0; i < numberOfUsers; i++) {
        const user = {
            name: `Test-${i}`,
            date_of_birth: getRandomDateBetween('1970-01-01', '2010-12-31'),
        };
        users.push(user);
    }
    return users;
}

async function bombard() {
    /** Config variables */
    const CONCURRENT_SIZE = 10;
    const BATCH_SIZE = 500;
    const TOTAL_REQUESTS = 10000000;

    const connection = await getConnection();
    const usersQueue = createUsers(TOTAL_REQUESTS);
    const startTime = Date.now();

    let i = 0;
    async function send() {
        const newUsers = [];
        for (let j = 0; j < BATCH_SIZE; j++) {
            const user = usersQueue.pop();
            if (user) {
                newUsers.push([user.name, user.date_of_birth]);
            } else {
                break;
            }
        }

        if (newUsers.length > 0) {
            const query = 'INSERT INTO users (name, date_of_birth) VALUES ?';
            await new Promise((res, rej) => {
                connection.query(query, [newUsers], (err, result) => {
                    if (err) {
                        rej(err)
                    } else {
                        res();
                    }
                });
            });
            i += newUsers.length;
        } else {
            return;
        }

        if (i > 0 && i % 1000 === 0) {
            console.log(`Progress: ${i / TOTAL_REQUESTS * 100}%`);
        }

        await send();
    }


    const promises = [];
    for (let i = 0; i < CONCURRENT_SIZE; i++) {
        promises.push(send());
    }

    await Promise.all(promises);

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;  // Convert to seconds
    const rps = TOTAL_REQUESTS / totalTime;

    console.log(`Total time taken: ${totalTime}s`);
    console.log(`Requests per second: ${rps}`);

    connection.end();
}


bombard().catch((err) => {
    console.log(err);
})
