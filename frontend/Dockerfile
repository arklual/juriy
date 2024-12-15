FROM node:17-alpine
RUN apk add --no-cache npm bash
WORKDIR /app
COPY package.json .                      
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]