## Verbesserungsmöglichkeiten

- [ ] Mehrere Sprachen anbieten
- [ ] Vorspulen syncen
- [ ] Abspielgeschwindigkeit syncen
- [ ] Doppelte Nachrichten beim erstellen und Beitreten eines Raumes verhindern
- [ ] VideoUrl und aktuelle Zeit mitteilen wenn jemand beitritt

## Start

## Dockerize

### Frontend

**Build an container**

```bash
docker build --secret id=npm,src=.npmrc . -t ghcr.io/dulliag/w2g-frontend:<TAG>
```

**Run the container**

> The app will be reachable under http://localhost:3000

```bash
docker run -itd -p 3000:80 --env-file '.env' --restart always --name=w2g-frontend ghcr.io/dulliag/w2g-frontend:<TAG>
```

### Backend

**Build an container**

```bash
docker build . -t ghcr.io/dulliag/w2g-backend:<TAG>
```

**Run the container**

> The app will be reachable under http://localhost:3001

```bash
docker run -itd -p 3001:8081 --env-file '.env' --restart always --name=w2g-backend ghcr.io/dulliag/w2g-backend:<TAG>
```
