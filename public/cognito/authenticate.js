import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  AuthFlowType,
} from "@aws-sdk/client-cognito-identity-provider";
import { CognitoJwtVerifier } from "aws-jwt-verify";

const userPoolId = "ap-southeast-2_zakn7Hf7X"; // Obtain from AWS console
const clientId = "162rnv81d0nht4fh2amtgfjnvm"; // Obtain from AWS console
const region = "ap-southeast-2"; // Your AWS region

const accessVerifier = CognitoJwtVerifier.create({
  userPoolId: userPoolId,
  tokenUse: "access",
  clientId: clientId,
});

const idVerifier = CognitoJwtVerifier.create({
  userPoolId: userPoolId,
  tokenUse: "id",
  clientId: clientId,
});

async function authenticate(username, password) {
  console.log("Getting auth token");

  const client = new CognitoIdentityProviderClient({ region });

  const command = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
    ClientId: clientId,
  });

  try {
    const res = await client.send(command);
    console.log("Authentication Result:", res);

    const accessToken = await accessVerifier.verify(
      res.AuthenticationResult.AccessToken
    );
    console.log("Access Token:", accessToken);

    const idToken = await idVerifier.verify(res.AuthenticationResult.IdToken);
    console.log("ID Token:", idToken);

    return res.AuthenticationResult; // Return tokens for further use
  } catch (err) {
    console.error("Error during authentication:", err);
    throw err;
  }
}

// Example usage
const username = "exampleuser";
const password = "SecurePassword123!";

authenticate(username, password);
