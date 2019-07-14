import * as firebase from "react-native-firebase";

const db = firebase.database()
const sanitize = (value) => value.replace(/\.|\//g, "")

export {
  db,
  sanitize
}
