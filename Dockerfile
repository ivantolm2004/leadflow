FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY server ./server
RUN mkdir -p /app/data && chown -R node:node /app
USER node
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server/app.js"]
