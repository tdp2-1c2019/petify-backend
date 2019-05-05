import * as bodyParser from "body-parser";
import * as express from "express";
import * as firebase from "firebase-admin";
import * as functions from "firebase-functions";

firebase.initializeApp(functions.config().firebase);

const database: firebase.database.Database = firebase.database();

async function getUser(fbid: string): Promise<any> {
  let driverSnapshot: firebase.database.DataSnapshot;
  let customerSnapshot: firebase.database.DataSnapshot;

  const driverPromise = database
    .ref("drivers")
    .child(fbid)
    .once("value");
  const customerPromise = database
    .ref("customers")
    .child(fbid)
    .once("value");

  [driverSnapshot, customerSnapshot] = await Promise.all([
    driverPromise,
    customerPromise
  ]);

  const driverProfile = driverSnapshot.val();
  const customerProfile = customerSnapshot.val();

  const userProfile = { fbid: fbid, ...driverProfile, ...customerProfile };

  userProfile.isDriver = Boolean(driverProfile);
  userProfile.isCustomer = Boolean(customerProfile);

  return userProfile;
}

const userExpress = express();
userExpress.use(bodyParser.json());
userExpress.use(bodyParser.urlencoded({ extended: false }));

userExpress.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const fbid = req.query.fbid;
    const response = await getUser(fbid);

    if (!response.isDriver && !response.isCustomer) {
      return res.status(404).send(response);
    }

    return res.status(200).send(response);
  } catch (e) {
    return res.status(500).send(e);
  }
});

async function getAvailableDrivers(): Promise<any> {
  let driversSnapshot: firebase.database.DataSnapshot;

  const driversPromise = database
    .ref("drivers")
    .once("value");

  [driversSnapshot] = await Promise.all([
    driversPromise
  ]);

  let driversProfile = driversSnapshot.val();
  Object.keys(driversProfile).forEach((k: string) => {
    if (driversProfile[k].disponible == undefined ||driversProfile[k].disponible == false || driversProfile[k].habilitado == false)
      driversProfile[k] = undefined
  });
  driversProfile = JSON.parse(JSON.stringify(driversProfile));

  return driversProfile;
}

export const user = functions.https.onRequest(userExpress);
export const findUser = functions.https.onCall(async (data, context) => {
  const fbid = data.fbid;
  const response = await getUser(fbid);
  return response;
});
export const asignarChoferes = functions.database.ref('/viajes/{id}').onCreate(async (snapshot, context) => {
  let lat = snapshot.val().origin_latitude;
  let lon = snapshot.val().origin_longitude;
  const choferes = await getAvailableDrivers();
  let distances = Object.keys(choferes).map(k => {
    let lat2 = choferes[k].lat;
    let lon2 = choferes[k].lat;
    let d = ((lat - lat2)^2 + (lon-lon2)^2)^0.5;
    return {key: k, distance: d};
  });
  distances.sort((x, y) => (x.distance > y.distance) ? 1 : -1)
  let final: any = {}
  for (let i = 0; i < distances.length; i++) {
    final[i] = distances[i].key;
  }
  await snapshot.ref.child("cantChoferes").set(distances.length);
  await snapshot.ref.child("posChoferAsignado").set(0);
  await snapshot.ref.child("choferes").set(final);
});
