import React from 'react';
import { Amplify } from 'aws-amplify';
import StyledLogin from './components/StyledLogin';
import awsExports from './aws-exports';
Amplify.configure(awsExports);

function App() {
  return (
    <div className="App">
      <StyledLogin />
    </div>
  );
}

export default App;