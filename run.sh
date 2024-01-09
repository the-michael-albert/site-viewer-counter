docker build -t site0counter .
docker run -p 80:3000 -v ./src/visitors.db:/app/visitors.db -d site0counter