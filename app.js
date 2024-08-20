const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const cors = require('cors');


app.use(cors());

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/helloprints',
  collection: 'sessions'
});

store.on('error', function (error) {
  console.log(error);
});

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 10 * 1000
  }
}));
app.use((req, res, next) => {
  console.log('------')
  console.log("session", req.session)
  if (req.session.user) {
    console.log('User is logged in');
  } else {
    console.log('User is logged out');
  }
  next();
});

app.use(express.json())
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Route imports
const invoice = require("./routes/invoiceRouter");
const combined = require("./routes/combinedRoute");
const permissionsRoutes = require('./routes/persmissionRoute');

app.use('/api/v1', permissionsRoutes);

app.use("/test/v1", invoice);
app.use("/test/v1", combined)



module.exports = app