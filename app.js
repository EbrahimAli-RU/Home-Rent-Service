const dotenv = require('dotenv');
dotenv.config({path: './config.env'})

process.on('uncaughtException', err => {
    console.log(err);
    console.log(`Uncaught Exception 🔥`);
    console.log(err.name, err.message);
    process.exit(1);
})

const path = require('path');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const rentalRouter = require('./router/rentalRouter');
const userRouter = require('./router/useRouter');
const AppError = require('./utils/appError');
const globalErrorController = require('./controller/errorController');
const viewRouter = require('./router/viewRouter');

mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser:true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {console.log(`DB connection Successfull`)})
.catch(err => {console.log(err);
    console.log(`Fail to connect DB`);
    console.log(err.name)
})

app.use(bodyParser.json());


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', viewRouter);
app.use('/api/v1/rental', rentalRouter);
app.use('/api/v1/user', userRouter);

//For undefined route which is not defined in our application

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
})

// Our global error handler middleware on express(err, req, res, next) this signeture.
app.use(globalErrorController);

const server = app.listen(process.env.PORT, () => {
    console.log(`Server listing on port ${process.env.PORT}`);
})

//Global unhandled rejection 
process.on('unhandledRejection', err => {
    console.log(`Unhandled Rejection`);
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    })
})