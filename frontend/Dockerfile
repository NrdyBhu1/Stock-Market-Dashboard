FROM node:alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install .

COPY . .

ENV VITE_BACKEND_URI=http://localhost:5000
ENV API_KEY=1Urje8ZSP9bZFelBgObPBFZgEgIdmoqNH3Aer9V76sqHqO5IS3ISdJxbahE6A48E

RUN npm run build   # creates production-ready build in /app/build or /app/dist

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]