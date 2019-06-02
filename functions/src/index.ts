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

  const userProfile = {...driverProfile, ...customerProfile};

  userProfile.isDriver = Boolean(driverProfile);
  userProfile.isCustomer = Boolean(customerProfile);

  return userProfile;
}

const userExpress = express();
userExpress.use(bodyParser.json());
userExpress.use(bodyParser.urlencoded({extended: false}));

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
    if (driversProfile[k].disponible == undefined || driversProfile[k].disponible == false || driversProfile[k].habilitado == false)
      driversProfile[k] = undefined
  });
  driversProfile = JSON.parse(JSON.stringify(driversProfile));

  return driversProfile;
}

export const user = functions.https.onRequest(userExpress);
export const findUser = functions.https.onCall(async (data, context) => {
  const fbid = data.fbid;
  return await getUser(fbid);
});
export const asignarChoferes = functions.database.ref('/viajes/{id}').onCreate(async (snapshot, context) => {
  let lat = snapshot.val().origin_latitude;
  let lon = snapshot.val().origin_longitude;
  const choferes = await getAvailableDrivers();

  await snapshot.ref.child("cantChoferes").set(Object.keys(choferes).length);
  if (Object.keys(choferes).length > 0) {
    let distances = Object.keys(choferes).map(k => {
      let lat2 = choferes[k].lat;
      let lon2 = choferes[k].lat;
      let d = ((lat - lat2) ^ 2 + (lon - lon2) ^ 2) ^ 0.5;
      return {key: k, distance: d};
    });
    distances.sort((x, y) => (x.distance > y.distance) ? 1 : -1);
    let final: any = {};
    for (let i = 0; i < distances.length; i++) {
      final[i] = distances[i].key;
    }
    await snapshot.ref.child("drivers").set(final);
    await snapshot.ref.child("intentosAsignacion").set(1);
    await database.ref("drivers").child(final[0]).child("viajeAsignado").set(context.params.id);
  }
});
export const rechazarViaje = functions.https.onCall(async (data, context) => {
  const viajeid = data.viajeid;
  const rechazaDriver = data.rechazaDriver || false;
  const intentosDS = await database.ref("viajes").child(viajeid).child("intentosAsignacion").once("value");
  const intentos: number = intentosDS.val();
  const cantChofDS = await database.ref("viajes").child(viajeid).child("cantChoferes").once("value");
  const cantChoferes = cantChofDS.val();
  let pos = 0;
  if (intentos % cantChoferes == 0) pos = cantChoferes - 1;
  else pos = (intentos % cantChoferes) - 1;
  const choferidDS = await database.ref("viajes").child(viajeid).child("drivers").child(pos.toString()).once("value");
  const choferid = choferidDS.val();

  console.log(choferid);
  await database.ref("drivers").child(choferid).child("viajeAsignado").remove();

  if (intentos < cantChoferes * 2) {
    if (intentos % 3 == 0)
      await database.ref("viajes").child(viajeid).child("estado").set(90);
    else {
      const nextchoferidDS = await database.ref("viajes").child(viajeid).child("drivers").child((intentos % cantChoferes).toString()).once("value")
      const nextchoferid = nextchoferidDS.val();
      await database.ref("viajes").child(viajeid).child("estado").set(0);
      await database.ref("viajes").child(viajeid).child("intentosAsignacion").set(intentos + 1);
      await database.ref("viajes").child(viajeid).child("chofer").set(nextchoferid);
      await database.ref("drivers").child(nextchoferid).child("viajeAsignado").set(viajeid);
    }
  } else {
    await database.ref("viajes").child(viajeid).child("estado").set(999);
  }

  const esReserva = (await database.ref("viajes").child(viajeid).child("reserva").once("value")).val();
  if (rechazaDriver && !esReserva) {
    const puntuacionDriverDS = await database.ref("drivers").child(choferid).child("puntuacion").once("value");
    const puntuacionesDriverDS = await database.ref("drivers").child(choferid).child("puntuaciones").once("value");
    const puntuacionDriver = puntuacionDriverDS.val();
    const puntuacionesDriver = puntuacionesDriverDS.val();

    const puntuacionPenalizacion = puntuacionDriver - 1;
    const nuevaPuntuacionesDriver = puntuacionesDriver + 1;

    const nuevaPuntuacion = (puntuacionDriver * puntuacionesDriver + puntuacionPenalizacion) / nuevaPuntuacionesDriver;

    await database.ref("drivers").child(choferid).child("puntuacion").set(nuevaPuntuacion);
    await database.ref("drivers").child(choferid).child("puntuaciones").set(nuevaPuntuacionesDriver);
  }

});
export const cancelarViaje = functions.https.onCall(async (data, context) => {
  const viajeid = data.viajeid;
  const intentosDS = await database.ref("viajes").child(viajeid).child("intentosAsignacion").once("value");
  const intentos: number = intentosDS.val();
  const cantChofDS = await database.ref("viajes").child(viajeid).child("cantChoferes").once("value");
  const cantChoferes = cantChofDS.val();
  let pos = 0;
  if (intentos % cantChoferes == 0) pos = cantChoferes - 1;
  else pos = (intentos % cantChoferes) - 1;
  const choferidDS = await database.ref("viajes").child(viajeid).child("drivers").child(pos.toString()).once("value");
  const choferid = choferidDS.val();

  await database.ref("drivers").child(choferid).child("viajeAsignado").remove();

  await database.ref("viajes").child(viajeid).child("estado").set(20);
});

export const seguirBuscando = functions.https.onCall(async (data, context) => {
  const viajeid = data.viajeid;
  const intentosDS = await database.ref("viajes").child(viajeid).child("intentosAsignacion").once("value");
  const intentos: number = intentosDS.val();
  const cantChofDS = await database.ref("viajes").child(viajeid).child("cantChoferes").once("value");
  const cantChoferes = cantChofDS.val();
  let pos = intentos % cantChoferes;
  const choferidDS = await database.ref("viajes").child(viajeid).child("drivers").child(pos.toString()).once("value");
  const choferid = choferidDS.val();

  await database.ref("viajes").child(viajeid).child("estado").set(0);
  await database.ref("viajes").child(viajeid).child("intentosAsignacion").set(intentos + 1);
  await database.ref("drivers").child(choferid).child("viajeAsignado").set(viajeid);
});


// cuando usuario cancela, limpiar pantalla a chofer
// cuando usuario sigue buscando, no aparece pantalla de ofrecer
