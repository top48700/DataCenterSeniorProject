const { Vonage } = require('@vonage/server-sdk');
const vonage = new Vonage({
  apiKey: 'b34cfc27',
  apiSecret: 'fS7Fp2U2WLa2O2Oj'
});
const sendSMS = (phoneNumber, otp) => {
    return new Promise((resolve, reject) => {
        const text = `Your OTP is ${otp}`;
        console.log(`Sending OTP ${otp} to ${phoneNumber} via SMS`);
        vonage.message.sendSms('SENDER_ID', phoneNumber, text, (err, responseData) => {
            if (err) {
                reject(err);
            } else {
                if (responseData.messages[0]['status'] === "0") {
                    resolve(responseData);
                } else {
                    reject(new Error(`Message failed with error: ${responseData.messages[0]['error-text']}`));
                }
            }
        });
    });
};
module.exports = {
    sendSMS,
};
