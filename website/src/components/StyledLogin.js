import React from 'react';
import { Authenticator, ThemeProvider, useTheme, View, Image, Text } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const components = {
  Header() {
    const { tokens } = useTheme();

    return (
      <View textAlign="center" padding={tokens.space.large}>
        <Image
          alt="TripJourney Logo"
          src="/logo192.png"
          width="50%"
          maxWidth="200px"
        />
      </View>
    );
  },

  Footer() {
    const { tokens } = useTheme();

    return (
      <View textAlign="center" padding={tokens.space.large}>
        <Text color={tokens.colors.neutral[80]}>
          &copy; {new Date().getFullYear()} Ing Technologies LLC. All rights reserved.
        </Text>
      </View>
    );
  },

  SignUp: {
    Header() {
      return null; // This removes the "Create Account" header
    },
    Footer() {
      return null; // This removes the "Have an account? Sign in" link
    },
  },
};

const StyledLogin = () => {
  const { tokens } = useTheme();

  const theme = {
    name: 'Auth Theme',
    tokens: {
      colors: {
        brand: {
          primary: {
            10: tokens.colors.teal[10],
            20: tokens.colors.teal[20],
            40: tokens.colors.teal[40],
            60: tokens.colors.teal[60],
            80: tokens.colors.teal[80],
            90: tokens.colors.teal[90],
            100: tokens.colors.teal[100],
          },
        },
      },
      components: {
        authenticator: {
          router: {
            borderWidth: '0',
          },
        },
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Authenticator components={components}
      hideSignUp={true}
      loginMechanisms={['email']}
      signUpAttributes={['email']}>
        {({ signOut, user }) => (
          <main>
            <h1>Hello {user.username}</h1>
            <button onClick={signOut}>Sign out</button>
          </main>
        )}
      </Authenticator>
    </ThemeProvider>
  );
};

export default StyledLogin;