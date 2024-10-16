const express = require('express');
const port = 3000;
const app = express();

const routings = require('./routings');

app.use(routings);
app.set('view engine','ejs')
app.listen(port, function () {
    console.log('Server is running on port:', port);
});
