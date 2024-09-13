import React from 'react';
import { Authenticator, ThemeProvider, View, Image, Text, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const components = {
  Header() {
    return (
      <View textAlign="center" padding="2rem">
        <Image
          alt="TripJourney Logo"
          src="/logo192.png"
          width="200px"
        />
      </View>
    );
  },
  SignIn: {
    Header() {
      return (
        <Heading level={3} padding="1rem">
          Sign in to your account
        </Heading>
      );
    },
    Footer() {
      return (
        <View textAlign="center" padding="1rem">
          <Text color="gray">
            &copy; {new Date().getFullYear()} Ing Technologies LLC. All rights reserved.
          </Text>
        </View>
      );
    },
  },
};

const StyledAuthenticator = ({ children }) => {
  const theme = {
    name: 'Custom Auth Theme',
    tokens: {
      colors: {
        brand: {
          primary: {
            10: '#f0f0f0',
            80: '#2196f3',
            90: '#1976d2',
            100: '#0d47a1',
          },
        },
      },
      components: {
        authenticator: {
          router: {
            borderWidth: '0',
          },
        },
        button: {
          primary: {
            backgroundColor: '#2196f3',
            _hover: {
              backgroundColor: '#1976d2',
            },
          },
        },
        fieldcontrol: {
          _focus: {
            borderColor: '#2196f3',
          },
        },
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Authenticator hideSignUp={true} 
      components={components}
      loginMechanisms={['email']}>
        {children}
      </Authenticator>
    </ThemeProvider>
  );
};

export default StyledAuthenticator;