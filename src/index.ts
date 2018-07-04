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
        .update({ available: false })
    })
      .catch(console.error);
  })

