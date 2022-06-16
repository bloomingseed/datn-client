# How to run
## 1. Open directly `index.html` on browser.
## 2. Copy necessary files to `dist/` folder and host it with NGINX/IIS/Apache, ...
- Copy necessary files to `dist/`:
```
cp --parent css/*.css js/*.js index.html dist
```
- Use NGINX to host client code and reverse proxy requests to api server:
```
upstream datn-api {
	server 127.0.0.1:8000; # domain name of api server
}

server {
	listen 80 default_server;
	listen [::]:80 default_server;

	location / {
		root /path/to/dist; # path to the `dist/` directory
		index index.html;
		try_files $uri/index.html $uri =404; # serve static files in `dist/`
	}

	location /api {
		proxy_pass http://datn-api; # proxy_pass api calls
		proxy_redirect off;
		proxy_set_header X-Real-IP  $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header Host $http_host;
		proxy_set_header X-NginX-Proxy true;
	}
}
```
