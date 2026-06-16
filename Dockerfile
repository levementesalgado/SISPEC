FROM denoland/deno:alpine

WORKDIR /app

COPY backend/ .

RUN deno cache src/index.ts

EXPOSE 10000

CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "--allow-sys", "src/index.ts"]
