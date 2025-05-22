# YOUTUBE BACKEND

- [models link](https://app.eraser.io/workspace/nxP7z7XY7UZFFexAI2cy)

## chronology

1. initialization: npm , public
2. setup : git, .gitignore generator, [app,constants,index].js
3. prettier configuration
4. src/ controllers, db, middlewares, models, routes, utils
5. package i

- __`db is always in another continent`-Hitesh Choudhry 📏__

6. db connection  

- __change in .env, reload nodemon required.__

```text
- token - user don't have to login on ever request
- accessToken - short lived
- if accessToken expires -> 404 to frontend then, frontend hit a endpoint where it refresh the accessToken with the help of refresh token.
```

```text
- mongoose internally converts string '_id' to object(string) whenever we use _id field . 
- but in aggregation pipeline it won't convert .
```
