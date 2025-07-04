module.exports = async function (context, req) {
  context.log('Returning mock public key');

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      public_key: "-----BEGIN PUBLIC KEY-----\nFAKEKEY123...\n-----END PUBLIC KEY-----"
    }
  };
};
