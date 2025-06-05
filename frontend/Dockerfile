FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY ./index.html /usr/share/nginx/html/index.html
COPY ./main.js    /usr/share/nginx/html/main.js
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
