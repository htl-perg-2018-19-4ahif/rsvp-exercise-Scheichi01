import { CREATED, BAD_REQUEST, UNAUTHORIZED } from 'http-status-codes';
import * as loki from 'lokijs';
import * as express from 'express';
import * as basic from 'express-basic-auth';

var app = express();
app.use(express.json());

const adminFilter = basic({ users: { admin: 'P@ssw0rd!' } });

const db = new loki(__dirname + '/db.dat', { autosave: true, autoload: true });
if (!db.getCollection('guests')) {
  db.addCollection<{ firstName: string, lastName: string }>('guests');
}

app.get('/guests', adminFilter, (req, res) => {
  let guestsReturn = db.getCollection<{ firstName: string, lastName: string }>('guests').find();
  res.send(guestsReturn.map(guests => (
    {
      firstName: guests.firstName,
      lastName: guests.lastName
    })));
});

app.get('/party', (req, res, next) => {
  res.send({
    title: 'Partytitle',
    location: 'Partylocation',
    date: "05.12.2018" //new Date(2018, 12, 4)
  });
});

app.post('/register', (req, res, next) => {
  if (!req.body.firstName || !req.body.lastName) {
    res.status(BAD_REQUEST).send('Missing mandatory member(s)');
  } else {
    const count = db.getCollection('guests').count();
    if (count < 10) {
      const newDoc = db.getCollection('guests').insert({ firstName: req.body.firstName, lastName: req.body.lastName });
      res.status(CREATED).send(newDoc);
    } else {
      res.status(UNAUTHORIZED).send('Sorry, max. number of guests already reached');
    }
  }
});

app.listen(8090);
