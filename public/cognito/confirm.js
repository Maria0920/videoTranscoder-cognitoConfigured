import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const clientId = "162rnv81d0nht4fh2amtgfjnvm"; // Obtain from AWS console
const region = "ap-southeast-2"; // Your AWS region

async function confirmSignUp(username, confirmationCode) {
  console.log("Confirming sign-up");

  const client = new CognitoIdentityProviderClient({ region });

  const command = new ConfirmSignUpCommand({
    ClientId: clientId,
    Username: username,
    ConfirmationCode: confirmationCode,
  });

  try {
    const res = await client.send(command);
    console.log("Confirmation Response:", res);
    return res;
  } catch (err) {
    console.error("Error confirming sign-up:", err);
    throw err;
  }
}

// Example usage
const username = "exampleuser";
const confirmationCode = "123456"; // Code received in the email

confirmSignUp(username, confirmationCode);
