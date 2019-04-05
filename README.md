# node-radio
Index and publish playlists

- npm install && node index.js
- change testFolder to point at your mp3 directory
- http://localhost:8000/init : rebuild DB (called on startup)
- http://localhost:8000/list will return a list of all mp3s in subdirectories
- http://localhost:8000/mp3 stream a given mp3 by filename

TODO
- stick all the vinyl objects and id3 tags in MongoDB
- return a JSON list, one folder level at a time
