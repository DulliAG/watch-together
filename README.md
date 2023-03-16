## Verbesserungsmöglichkeiten

- [ ] Mehrere Sprachen anbieten
- [ ] Vorspulen syncen
- [ ] Abspielgeschwindigkeit syncen
- [ ] Doppelte Nachrichten beim erstellen und Beitreten eines Raumes verhindern
- [ ] VideoUrl und aktuelle Zeit mitteilen wenn jemand beitritt

## Start

## Initial Setup

### Frontend

1. Clone repo
2. Setup `.npmrc`
3. Install dependencies
4. Run npm start

## Dockerize

**Ports**

> Do not change ports, because they are staticlly assigned in the source code.

| External Port | Internal Port | Used by  |
| :-----------: | :-----------: | :------: |
|    `3000`     |    `3000`     | Frontend |
|    `8080`     |    `8080`     | Backend  |

### Frontend

**Build an container**

```bash
docker build --secret id=npm,src=.npmrc . -t ghcr.io/dulliag/w2g-frontend:<TAG>
```

if you don't have `DOCKER_BUILDKIT` set as an environment-variable you need to use

```bash
DOCKER_BUILDKIT=1 docker build --secret id=npm,src=.npmrc . -t ghcr.io/dulliag/w2g-frontend:<TAG>
```

**Run the container**

> The app will be reachable under http://localhost:3000

```bash
docker run -itd -p 3000:80 -e TZ=Europe/Berlin --restart always --name=w2g-frontend ghcr.io/dulliag/w2g-frontend:<TAG>
```

### Backend

**Build an container**

```bash
docker build . -t ghcr.io/dulliag/w2g-backend:<TAG>
```

**Run the container**

> The app will be reachable under http://localhost:8080

```bash
docker run -itd -p 8080:8080 -e TZ=Europe/Berlin --env-file='.env' --restart always --name=w2g-backend ghcr.io/dulliag/w2g-backend:<TAG>
```
