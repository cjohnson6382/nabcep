import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'

import { firebaseConfig } from './config'

firebase.initializeApp(firebaseConfig)

export const db = firebase.firestore()

const settings = { timestampsInSnapshots: true};
db.settings(settings);

export const storage = firebase.storage()

export { firebase }