const { Expo } = require('expo-server-sdk')
let expo = new Expo()

module.exports = function sendPushNotifications(tokens, title, body, data) {
          let notifications = [];
          for (let pushToken of tokens) {
                    if (!Expo.isExpoPushToken(pushToken)) {
                              console.error(`Push token ${pushToken} is not a valid Expo push token`);
                              continue;
                    }

                    notifications.push({
                              to: pushToken,
                              sound: "default",
                              title: title,
                              body: body,
                              data
                    });
          }

          let chunks = expo.chunkPushNotifications(notifications);

          (async () => {
                    for (let chunk of chunks) {
                              console.log(chunk)
                              try {
                                        let receipts = await expo.sendPushNotificationsAsync(chunk);
                              } catch (error) {
                                        console.error(error);
                                        // if(error.code == 'PUSH_TOO_MANY_EXPERIENCE_IDS') {
                                        //           sendPushNotifications(error.details['@dukizwe/psr-app'], title, body, data)
                                        // }
                              }
                    }
          })();
};