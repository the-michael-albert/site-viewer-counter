docker build -t site0counter .
docker run -p 3000:3000 -v ./src/visitors.db:/app/visitors.db -d site0counter