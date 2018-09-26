const functions = require('firebase-functions')
const admin = require('firebase-admin')

const cors = require('cors')({ origin: true })
const path = require('path')
const os = require('os')
const csvjson = require('csvjson')

const PubSub = require(`@google-cloud/pubsub`)

const express = require('express')
const fs = require('fs-extra')

// const APIControllers = require('authorizenet').APIControllers
// const APIContracts = require('authorizenet').APIContracts
// const SDKConstants = require('authorizenet').SDKConstants

const { APIControllers, APIContracts, SDKConstants } = require("authorizenet")

const app = express()
app.use(cors)
admin.initializeApp(functions.config().firebase)

const db = admin.firestore()
const storage = admin.storage()

const bucket = storage.bucket()

// const apiLoginId = functions.config().authorizenet.apiloginid
// const transactionKey = functions.config().authorizenet.transactionkey

const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType()
merchantAuthenticationType.setName(functions.config().authorizenet.apiloginid)
merchantAuthenticationType.setTransactionKey(functions.config().authorizenet.transactionkey)

// enable production mode
// ctrl.setEnvironment(SDKConstants.endpoint.production);

const pubsub = new PubSub()

const batchInsert = users => {
	let batch = db.batch()
	
	users.forEach(u => {
		let uRef = db.collection("users").doc()
		batch.set(uRef, u)
	})
	
	return batch.commit()
}


const authorizenetPayCallback = ctrl => {
	return new Promise((resolve, reject) => {
		ctrl.execute(() => {
			const apiResponse = ctrl.getResponse()
			response = new APIContracts.CreateTransactionResponse(apiResponse)
			
			console.log(JSON.stringify(response, null, 2))
		
			if ( response !== null ) {
				if ( response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK ) {
					if( response.getTransactionResponse().getMessages() !== null ) {
						console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId())
						console.log('Response Code: ' + response.getTransactionResponse().getResponseCode())
						console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode())
						console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription())
						
						console.log("response refId", response.refId)
						
						db.collection("ref_map").doc(response.refId).get()
							.then(hId => resolve( Object.assign({}, response, { refId: hId.data().id } ) ) )
							.catch(e => console.log(e))
						// resolve(response)
					}
					else {
						console.log('Failed Transaction.')
						if( response.getTransactionResponse().getErrors() !== null ) {
							console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
							console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
							reject(response)
						}
					}
				}
				else {
					console.log('Failed Transaction. ');
					if( response.getTransactionResponse() !== null && response.getTransactionResponse().getErrors() !== null ) {
					
						console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode())
						console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText())
						reject(response)
					}
					else {
						console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode())
						console.log('Error message: ' + response.getMessages().getMessage()[0].getText())
						reject(response)
					}
				}
			}
			else {
				console.log('Null Response.')
				reject(response)
			}
		})
	})
}


const hasher = id => {
	let hash = 0, c
	if (id.length === 0) return hash
	for ( let i = 0; i < id.length; i++ ) {
		c = id.charCodeAt(i)
		hash = ( (hash << 5) - hash ) + c
		hash = hash & hash
	}

	return hash
}

/*

body = {
	opaqueData: {
	  "dataDescriptor": "COMMON.ACCEPT.INAPP.PAYMENT",
	  "dataValue": "eyJjb2RlIjoiNTBfMl8wNjAwMDUzOTY0QjEwNzY3Q0Y4QzcyQjM0RTNDMzFCMjQ4M0ExMUNFMzEzNUVDMjAxQTdEMzAyOUZCQ0RGMEUyRUNDQTJEMzUzNjE1QTg5RDU3REEzMzMzQURBMzA5Rjc1RTM4MkEwIiwidG9rZW4iOiI5NTM2NTMyNjE5NzkxMDMyNTA0NjAzIiwidiI6IjEuMSJ9"
	},
	amount: 10.00
}

*/
app.post('/pay', (req, res) => {
	const body = req.body
	
	const opaqueData = new APIContracts.OpaqueDataType()
	opaqueData.dataDescriptor = body.opaqueData.dataDescriptor
	opaqueData.dataValue = body.opaqueData.dataValue
	
	const paymentType = new APIContracts.PaymentType()
	paymentType.setOpaqueData(opaqueData)
	
	// add all the extended order data, like tax, invoice, description, duty, billto, shipto, line items, transaction details, user fields,

	const transactionRequestType = new APIContracts.TransactionRequestType()
	transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION)
	transactionRequestType.setPayment(paymentType)
	transactionRequestType.setAmount(body.amount)
	
	const createRequest = new APIContracts.CreateTransactionRequest()
	createRequest.setMerchantAuthentication(merchantAuthenticationType)
	createRequest.setTransactionRequest(transactionRequestType)
	
	// add a refId to the transaction so it can be linked to a payment in our database
	
	hId = hasher(body.refId).toString()
	
	return db.collection("ref_map").doc(hId).set({ id: body.refId })
		.then(() => {
			createRequest.setRefId(hId)
			console.log(JSON.stringify(createRequest.getJSON(), null, 2))
			return createRequest
		})
		.then(createRequest => new APIControllers.CreateTransactionController(createRequest.getJSON()))
		.then(ctrl => authorizenetPayCallback(ctrl))
		.then(r => res.json(r))
		.catch(e => res.json(e))
})



/*
// trigger from firebase functions:shell node environment
	file = fs.createReadStream('/home/cjohnson/Downloads/projects/nabcep/functions/users.txt')
	file.pipe(api.post('import_users'))
*/

app.post('/import_users', (req, res) => {
	const file = req.body
	const options = { delimiter: ",", quote: '"' }
	const r = csvjson.toObject(file, options)
	
	// import users in groups of 450 to the database
	let impSize = 450
	let chunks = Math.ceil(r.length/450)
	chunks++
	
	let pp = []
	for (let i = 0; i < chunks; i++) {
		let uu = r.slice(i*impSize, (i + 1)*impsize)
		pp.push(batchInsert(uu))
	}
	
	// I don't know if this will set off the Firestore quotas for insert size/frequency, but I'm doing about 45 inserts and 20,000 records
	return Promise.all(pp)
		.then(rr => {
			return rr.every(e => e === false) ?
				res.send({ status: "success", message: "users inserted into DB" })
					:
				res.send({ status: "error", message: "some users were not inserted into the database correctly" })

			// if (rr.every(e => e === false)) res.send({ status: "success", message: "users inserted into DB" })
			// else res.send({ status: "error", message: "some users were not inserted into the database correctly" })
		})
		.catch(e => console.log("error inserting users into the DB"))
	
	// res.send({ status: "success", message: "extracted data from textfile", data: r.slice(0, 3) })
})


const saveScore = score => {
	let uRef = db.collection("users").where("uid", "=", score.uid)
	// start transaction
	db.runTransaction(t => {
		// get user by id
		return t.get(uRef)
			.then(userSnapshot => {
				// put score with user on it in the results collection
				rRef = db.collection("results").doc()
				let s = Object.assign({}, score, { user: userSnapshot.data(), userId: userSnapshot.id })
				t.set(rRef, s)
				return { userSnapshot, id: rRef.id }
			})
			.then(({userSnapshot, id}) => {
				// put score on a sub-collection on the user's resource
				let rRef = userSnapshot.ref.collection("test_results").doc(id)
				t.set(rRef, score)
				return { user: userSnapshot.id, score: rRef.id }
			})
			// commit the transaction and return the promize
			.then(({ user, id }) => console.log(`inserted score (${id}) on user (${user})`))
			.catch(e => {
				console.log("transaction failed: ", e)
				return true
			})
	})
	
}



/*
// trigger from firebase functions:shell node environment
	file = fs.createReadStream('/home/cjohnson/Downloads/projects/nabcep/functions/april.csv')
	file.pipe(api.post('test_scores'))
*/
app.post('/test_scores', (req, res) => {
	const file = req.body
	let r = csvjson.toObject(file)
	
	let pp = r.map(score => saveScore(score))
	return Promise.all(pp)
		.then(rr => {
			return rr.every(e => !e) ?
				res.send({ status: "success", message: "inserted scores into database" })
					:
				res.send({ status: "error", message: "failed to insert all the scores" })
				
			// if (rr.every(e => !e)) res.send({ status: "success", message: "inserted scores into database" })
			// else res.send({ status: "error", message: "failed to insert all the scores" })
		})
		.catch(e => res.send({ status: "error", message: "resolving transactions promises failed", data: e }) )
})



app.post('/notifications', (req, res) => {
	
})


exports.api = functions.https.onRequest(app)

exports.paymentLogger = functions.firestore.document("payments/{id}").onUpdate((change, context) => {
	console.log(change.after.data())
	console.log(change.after)

	const p = change.after.data()
	return db.collection("logs").doc().set(
		{ 
			id: change.after.id, 
			message: `payment transaction posted with id: ${change.after.id}`, 
			code: p.payment.messages,
			created: admin.firestore.Timestamp.now()
		}
	)
		.then(() => null)
		.catch(e => console.log("payment logger errored"))
})

exports.mirrorUsers = functions.firestore.document("users/{userId}").onCreate((snap, context) => {
	// send the user over to an endpoint connected to an SQL database so that they can have local mirroring of their users
})

exports.mirrorScores = functions.firestore.document("results/{resultId}").onCreate((snap, context) => {
	// send the test result over to an endpoint connected to an SQL database so that they can have local mirroring of their test results
})


const logger = message => {
	// pubsub.topic("logging").publisher().publish({ message }).then(() => null).catch(e => console.log("error publishing message", e))
}

// exports.logging = functions.pubsub.topic("logging").onPublish(message => {
// 	return db.collection("transaction_log").doc().set(message.json).then(() => null).catch(e => console.log(e))
// })



	// const tmpFile = '/tmp/scores.csv'
	// return fs.writeFile(tmpFile, files[0])
	// 	.then(e => {
	// 		if (e) { return res.send({ status: "error", message: "could not write file to tmp filesystem", err: e }) }
	// 		else {
	// 			return fs.readFile(tmpFile, { encoding : 'utf8'})
	// 				.then(file => {
	// 					let r = csvjson.toObject(file)
						
	// 					res.send({ status: "success", message: "got back some CSV lines", data: r.slice(0, 3) })
	// 				})
	// 				.catch(e => res.send({ status: "error", message: "failed to read temp CSV file", err: e }))
	// 		}
	// 	})
	// 	.catch(e => res.send({ status: "error", message: "error calling fs.writeFile", err: e }))
	
	// res.send({ status: "success", message: "finished the test_scores route", data: })
	
	