# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build args for baking env vars at build time (optional, but safer to do runtime injection if possible, 
# strictly for 'VITE_' vars they are baked in at build time)
ARG VITE_GOOGLE_API_KEY
ARG VITE_GOOGLE_MODEL
ARG VITE_GOOGLE_VOICE
ARG VITE_AI_LANGUAGE
ARG VITE_AI_STYLE

ENV VITE_GOOGLE_API_KEY=$VITE_GOOGLE_API_KEY
ENV VITE_GOOGLE_MODEL=$VITE_GOOGLE_MODEL
ENV VITE_GOOGLE_VOICE=$VITE_GOOGLE_VOICE
ENV VITE_AI_LANGUAGE=$VITE_AI_LANGUAGE
ENV VITE_AI_STYLE=$VITE_AI_STYLE

RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
