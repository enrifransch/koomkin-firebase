import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const onBriefStatusChange = functions.database
    .ref('brief/{briefId}')
    .onUpdate(change => {
        return new Promise((resolve, reject) => {
            const after = change.after

            if (after.val() === 'true') {
                resolve();
            }

            return admin.firestore()
                .collection('brief')
                .doc(after.key)
                .update({available: false})
        })
            .catch(console.error);

    });

export const onUpdateActiveStatus = functions.https
    .onRequest((request, response) => {
        admin.firestore().collection('brief')
            .get()
            .then(function (querySnapshot) {
                const arr = []
                const promiseList = []
                querySnapshot.forEach((doc) => {
                    const id = doc.id;
                    const now = Date.now() - 7200000;
                    if (now > doc.data().lastUpdate) {
                        if (doc.data().available) {
                            promiseList.push(admin.firestore().collection('brief').doc(id).update({available: false}));
                            arr.push(id)
                        }
                    }
                });
                if (promiseList.length > 0) {
                    Promise.all(promiseList)
                        .then(res => {
                            response.send({message: 'Documents updated', documents: arr})
                        })
                        .catch(error => {
                            response.status(500).send(error)
                        })
                }
                else {
                    response.send({message: 'No documents updated'})
                }
            })
            .catch(function (error) {
                response.status(500).send(error)
            });
    });