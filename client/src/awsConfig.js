const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: "eu-west-2_t27V5la2x",
      userPoolClientId: "47g5dhprnn0ttlbvghp9q4f7ro",

      loginWith: {
        oauth: {
          domain: "eu-west-2t27v5la2x.auth.eu-west-2.amazoncognito.com",
          scopes: [
            "openid",
            "email",
            "profile"
          ],
          redirectSignIn: [
            "http://localhost:5173/"
          ],
          redirectSignOut: [
            "http://localhost:5173/"
          ],
          responseType: "code"
        }
      }
    }
  }
};

export default awsConfig;