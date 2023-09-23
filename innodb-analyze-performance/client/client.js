const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'user',
    password: 'pass',
    database: 'projector'
});
let _connection;
connection.connect((error) => {
    if (error) {
        console.error('Error connecting to the database:', error.stack);
        return;
    }
    console.log('Connected to the database as id:', connection.threadId);
    _connection = connection;
});


function getConnection () {
    return new Promise(res => {
        const intervalId = setInterval(() => {
            if (_connection) {
                clearInterval(intervalId);
                res(_connection);
            }
        }, 100);
    })
}



module.exports = {
    getConnection,
}
