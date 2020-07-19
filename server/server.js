const express = require('express')
const app = express()
const $path = require('path')
const port = process.env.PORT || 5000
const gamesPath = $path.resolve('./games')
const fs = require('fs')

app.get('/games', (request, response) => {
    console.log("hello")
    const theFile = $path.join(gamesPath, 'games.json')
    const data = fs.readFileSync(theFile);
    const json = JSON.parse(data);
    response.type('json').send(json)
})

console.log("hi")

app.post('/games',
    express.json(),
    (request, response) => {
        console.log("yo")
        const theFile = $path.join(gamesPath, 'games.json')
        fs.writeFileSync(theFile, JSON.stringify(request.body));
        response.status(201).send('Success')
})

app.listen(port, () => console.log(`Listening on port ${port}!`))