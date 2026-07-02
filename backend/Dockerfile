FROM denoland/deno:alpine-2.1.0

WORKDIR /app

COPY . .

RUN deno cache src/index.ts

EXPOSE 10000

CMD echo '{"lotes":[],"animais":[],"pesagens":[]}' > data/db.json && \
    echo '{"animalId":0,"loteId":0,"pesagemId":0}' > data/counters.json && \
    deno run --allow-read --allow-write --allow-env src/seed.ts && \
    deno run --allow-net --allow-read --allow-write --allow-env --allow-sys src/index.ts
