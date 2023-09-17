# HW8. Web Servers - nginx cache
Nginx config which serves static content(images) and caches response after 2+ hits and ability to manually invalidate cache.

### Endpoints
- `/onlyfans_images/<filename>.png` - Folder with onlyfans images. For different variants see [folder](./onlyfans_images). This response is cached after 2 requests
- `/purge/onlyfans_images/<filename>.png` - purges cache for this particular image
### How to run
1. Create container
```bash
docker build -t nginx-onlyfans-image-cache .
```

2. Start nginx server
```bash
docker run -v ${PWD}/onlyfans_images:/var/data/onlyfans_images -p 8080:8080 nginx-onlyfans-image-cache 
```

### Examples
```bash
curl 'http://localhost:8080/onlyfans_images/big_stronk_fan.png' --head
```
_Response:_
```
HTTP/1.1 200 OK
Server: nginx/1.25.2
Date: Sun, 17 Sep 2023 19:20:18 GMT
Content-Type: text/plain
Content-Length: 2063486
Connection: keep-alive
Last-Modified: Thu, 14 Sep 2023 15:56:11 GMT
ETag: "65032d1b-1f7c7e"
X-Cache: HIT
X-File: big_stronk_fan.png
Accept-Ranges: bytes
```
