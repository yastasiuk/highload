# HW5. Stress Testing. Approaches and tools

### Project structure
```
.
├── simple-server - Simple python service which stores request data to MySQL\
    ... server internals..
├── siege.conf - configuration for siege
├── Dockerfile - Docker file for runnig
└── README.md - some random docs
```

### Endpoints
- `/statistics` - getting information about fetched URLS(testing purposes)
- `/*` - fallback route, which adds requested ULR to MySQL(except `/favicon.ico`)
URL request schema:
```python
class Request(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500))
    method = db.Column(db.String(10))
    user_agent = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
```

### How to start
1. Start python service with MySQL
```bash
cd ./simple_server
docker-compose up --build
```
2. Go to siege folder
```bash
cd ./siege 
```
3. Try crushing the server via siege(not gonna happen)
```bash
  docker build -t simple-server-siege-container .
  docker run --network=simple_server_default --rm simple-server-siege-container --concurrent=1 --time=5S
```
For more options see [Siege docs](https://github.com/JoeDog/siege/blob/master/doc/siege.pod)

### Results
1. 10 concurrency
```bash
docker run --network=simple_server_default --rm simple-server-siege-container --concurrent=10 --time=30S
```
| Metric                    | Value            |
|---------------------------|------------------|
| Transactions              | 10832 hits       |
| Availability              | 100.00 %         |
| Elapsed time              | 29.17 secs       |
| Data transferred          | 0.00 MB          |
| Response time             | 0.03 secs        |
| Transaction rate          | 371.34 trans/sec |
| Throughput                | 0.00 MB/sec      |
| Concurrency               | 9.97             |
| Successful transactions  | 10832            |
| Failed transactions      | 0                |
| Longest transaction       | 0.30             |
| Shortest transaction      | 0.01             |

2. 25 concurrency
```bash
docker run --network=simple_server_default --rm simple-server-siege-container --concurrent=25 --time=30S
```
| Metric                    | Value            |
|---------------------------|------------------|
| Transactions              | 11296 hits       |
| Availability              | 100.00 %         |
| Elapsed time              | 29.58 secs       |
| Data transferred          | 0.00 MB          |
| Response time             | 0.07 secs        |
| Transaction rate          | 381.88 trans/sec |
| Throughput                | 0.00 MB/sec      |
| Concurrency               | 24.94            |
| Successful transactions  | 11296            |
| Failed transactions      | 0                |
| Longest transaction       | 0.46             |
| Shortest transaction      | 0.02             |

3. 50 concurrency
```bash
docker run --network=simple_server_default --rm simple-server-siege-container --concurrent=50 --time=30S
```

4. 100 concurrency
```bash
docker run --network=simple_server_default --rm simple-server-siege-container --concurrent=100 --time=30S
```
| Metric                    | Value            |
|---------------------------|------------------|
| Transactions              | 11997 hits       |
| Availability              | 100.00 %         |
| Elapsed time              | 29.14 secs       |
| Data transferred          | 0.00 MB          |
| Response time             | 0.24 secs        |
| Transaction rate          | 411.70 trans/sec |
| Throughput                | 0.00 MB/sec      |
| Concurrency               | 99.55            |
| Successful transactions  | 11997            |
| Failed transactions      | 0                |
| Longest transaction       | 0.36             |
| Shortest transaction      | 0.01             |
