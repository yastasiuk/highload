const { getConnection } = require('./client');


const Simulations = {
    singleDate: 'singleDate',
    singleDateLimit50000: 'singleDateLimit50000',
    wholeYear: 'wholeYear',
    wholeYearLimit50000: 'wholeYearLimit50000',
    multipleYears: 'multipleYears',
    multipleYearsLimit50000: 'multipleYearsLimit50000'
}
const QUERIES = {
    [Simulations.singleDate]: `
    SELECT *
      FROM users
      WHERE date_of_birth = '1991-12-30';
    `,
    [Simulations.singleDateLimit50000]: `
    SELECT *
      FROM users
      WHERE date_of_birth = '1991-12-30'
      LIMIT 50000;
    `,
    [Simulations.wholeYear]: `
      SELECT *
      FROM users
      WHERE date_of_birth >= '1999-01-01' AND date_of_birth <= '1999-12-31';
    `,
    [Simulations.wholeYearLimit50000]: `
      SELECT *
      FROM users
      WHERE date_of_birth >= '1999-01-01' AND date_of_birth <= '1999-12-31'
      LIMIT 50000;
    `,
    [Simulations.multipleYears]: `
      SELECT *
      FROM users
      WHERE date_of_birth >= '2000-01-01' AND date_of_birth <= '2010-12-31';
    `,
    [Simulations.multipleYearsLimit50000]: `
      SELECT *
      FROM users
      WHERE date_of_birth >= '2000-01-01' AND date_of_birth <= '2010-12-31' LIMIT 50000;
    `
}

const results = {
    [Simulations.singleDate]: {
        best: undefined,
        worst: undefined,
        average: undefined
    },
    [Simulations.wholeYear]: {
        best: undefined,
        worst: undefined,
        average: undefined
    },
    [Simulations.wholeYearLimit50000]: {
        best: undefined,
        worst: undefined,
        average: undefined
    },
    [Simulations.multipleYears]: {
        best: undefined,
        worst: undefined,
        average: undefined
    },
    [Simulations.multipleYearsLimit50000]: {
        best: undefined,
        worst: undefined,
        average: undefined
    },
}

async function runTests() {
    const connection = await getConnection();
    for(let type of Object.keys(Simulations)) {
        console.log('-------------------------------');
        console.log(`Running simulations for ${type}`);
        const times = [];
        for (let i = 0; i < 10; i++) {
            console.log(`Epoch ${i + 1}`);
            const executionTime = await new Promise((res, rej) => {
                const startTime = Date.now();
                connection.query(QUERIES[type], (err, results) => {
                    if (err) {
                        rej('Error executing query:', err);
                        return;
                    }
                    res((Date.now() - startTime) / 1000);
                });
            });
            console.log(`Epoch ${i + 1} finished in ${executionTime} seconds`);
            times.push(executionTime);
        }
        results[type] = {
            best: Math.min(...times),
            worst: Math.max(...times),
            average: times.reduce((acc, curr) => acc + curr, 0) / times.length,
        }
    }
    console.table(results);
    connection.end();
}
runTests().catch(err => {
    console.log(err);
})

