import * as bodyParser from "body-parser";
import * as express from 'express';
import * as firebase from 'firebase-admin';
import * as functions from 'firebase-functions';

firebase.initializeApp(functions.config().firebase);

const database: firebase.database.Database = firebase.database();

async function getUser(fbid: string): Promise<any> {
  let driverSnapshot: firebase.database.DataSnapshot;
  let customerSnapshot: firebase.database.DataSnapshot;

  const driverPromise = database.ref('drivers').child(fbid).once('value');
  const customerPromise = database.ref('customers').child(fbid).once('value');

  [driverSnapshot, customerSnapshot] = await Promise.all([driverPromise, customerPromise]);

  const driverProfile = driverSnapshot.val();
  const customerProfile = customerSnapshot.val();

  const userProfile = {...driverProfile, ...customerProfile};

  userProfile.isDriver = Boolean(driverProfile);
  userProfile.isCustomer = Boolean(customerProfile);

  return userProfile;
}

const userExpress = express();
userExpress.use(bodyParser.json());
userExpress.use(bodyParser.urlencoded({extended: false}));

userExpress.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const fbid = req.query.fbid;
    const response = await getUser(fbid);

    if (!response.isDriver && !response.isCustomer) {
      return res.status(404);
    }

    return res.status(200).send(response);
  } catch (e) {
    return res.status(500).send(e);
  }
});

export const user = functions.https.onRequest(userExpress);
export const findUser = functions.https.onCall(async (data, context) => {
  const fbid = data.fbid;
  const response = await getUser(fbid);
  return response;
});
