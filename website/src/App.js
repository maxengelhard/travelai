import React from 'react';
import { Amplify } from 'aws-amplify';
import StyledLogin from './components/StyledLogin';


const updatedAwsConfig = {
  "aws_project_region": "us-east-1",
  "aws_cognito_identity_pool_id": process.env.REACT_APP_AWS_COGNITO_IDENTITY_POOL_ID,
  "aws_cognito_region": "us-east-1",
  "aws_user_pools_id": process.env.REACT_APP_AWS_USER_POOLS_ID,
  "aws_user_pools_web_client_id": process.env.REACT_APP_AWS_USER_POOLS_WEB_CLIENT_ID,
  // "aws_cloud_logic_custom": [
  //   {
  //       "name": "stripeAPI",
  //       "endpoint": process.env.REACT_APP_STRIPE_END_POINT,
  //       "region": "us-east-1"
  //   }
  // ]
  // oauth: {
  //   ...awsConfig.oauth,
  //   redirectSignIn: isLocalhost ? localRedirectSignIn : productionRedirectSignIn,
  //   redirectSignOut: isLocalhost ? localRedirectSignOut : productionRedirectSignOut,
  // },
}

Amplify.configure(updatedAwsConfig);

function App() {
  return (
    <div className="App">
      <StyledLogin />
    </div>
  );
}

export default App;