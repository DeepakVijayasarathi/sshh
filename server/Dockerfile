FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p uploads/members uploads/events uploads/gallery uploads/news uploads/businesses uploads/resumes uploads/settings
EXPOSE 5000
CMD ["node", "server.js"]
