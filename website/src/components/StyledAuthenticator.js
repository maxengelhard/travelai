import React, { useState } from 'react';
import { Authenticator, ThemeProvider, View, Text, Heading, Button, TextField,Image,Flex, useTheme , Card, useAuthenticator} from '@aws-amplify/ui-react';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';
import { motion } from 'framer-motion';


const Header = () => (
  <View textAlign="center" padding="2rem">
    <Image
      alt="TripJourney Logo"
      src="/logo192.png"
      width="200px"
    />
  </View>
);

const Footer = () => (
  <Text textAlign="center" color="gray" padding="1rem">
    &copy; {new Date().getFullYear()} Ing Technologies LLC. All rights reserved.
  </Text>
);

const ForgotPasswordForm = ({ onCancel }) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('request');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { tokens } = useTheme();

  const handleResetPassword = async () => {
    try {
      const output = await resetPassword({ username: email });
      handleResetPasswordNextSteps(output);
    } catch (error) {
      console.log(error);
      setError(`Error: ${error.message}`);
    }
  };

  const handleResetPasswordNextSteps = (output) => {
    const { nextStep } = output;
    switch (nextStep.resetPasswordStep) {
      case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
        const codeDeliveryDetails = nextStep.codeDeliveryDetails;
        setMessage(`Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`);
        setStep('confirm');
        break;
      case 'DONE':
        setMessage('Successfully reset password.');
        onCancel();
        break;
      default:
        setError('An unexpected error occurred.');
        break;
    }
  };

  const handleConfirmResetPassword = async () => {
    try {
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
      setMessage('Password reset successful. You can now sign in with your new password.');
      onCancel();
    } catch (error) {
      console.log(error);
      setError(`Error: ${error.message}`);
    }
  };

const cardStyles = {
    maxWidth: '400px',
    width: '100%',
    margin: '2rem auto',
    padding: tokens.space.xl,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.radii.large,
  };

  const headingStyles = {
    marginBottom: tokens.space.xl,
    color: tokens.colors.font.primary,
    textAlign: 'center',
  };

  const buttonStyles = {
    marginTop: tokens.space.medium,
    transition: 'all 0.2s ease-in-out',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
  };

  const linkButtonStyles = {
    color: tokens.colors.brand.primary[80],
    ':hover': {
      color: tokens.colors.brand.primary[100],
    },
  };

  const messageStyles = {
    marginTop: tokens.space.medium,
    padding: tokens.space.small,
    borderRadius: tokens.radii.small,
    textAlign: 'center',
  };

  const formContent = step === 'request' ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Heading level={3} style={headingStyles}>Reset Your Password</Heading>
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ marginBottom: tokens.space.medium }}
      />
      <Flex direction="row" justifyContent="space-between" alignItems="center">
        <Button onClick={onCancel} variation="link" style={linkButtonStyles}>
          Back to Sign In
        </Button>
        <Button onClick={handleResetPassword} variation="primary" style={buttonStyles}>
          Reset Password
        </Button>
      </Flex>
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Heading level={3} style={headingStyles}>Confirm New Password</Heading>
      <TextField
        label="Confirmation Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        style={{ marginBottom: tokens.space.medium }}
      />
      <TextField
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        style={{ marginBottom: tokens.space.medium }}
      />
      <Flex direction="row" justifyContent="space-between" alignItems="center">
        <Button onClick={() => setStep('request')} variation="link" style={linkButtonStyles}>
          Back
        </Button>
        <Button onClick={handleConfirmResetPassword} variation="primary" style={buttonStyles}>
          Confirm New Password
        </Button>
      </Flex>
    </motion.div>
  );

  return (
    <Card variation="elevated" style={cardStyles}>
      {formContent}
      {error && (
        <Text color={tokens.colors.font.error} style={{...messageStyles, backgroundColor: tokens.colors.background.error}}>
          {error}
        </Text>
      )}
      {message && (
        <Text color={tokens.colors.font.success} style={{...messageStyles, backgroundColor: tokens.colors.background.success}}>
          {message}
        </Text>
      )}
    </Card>
  );
};

const AuthenticatedContent = ({ children }) => {
  const { user, signOut } = useAuthenticator((context) => [context.user, context.signOut]);
  return typeof children === 'function' ? children({ user, signOut }) : children;
};

const StyledAuthenticator = ({ children }) => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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

  const components = {
    Header,
    Footer,
    SignIn: {
      Header() {
        return <Heading level={3}>Sign in to your account</Heading>;
      },
      Footer() {
        return (
          <View textAlign="center">
            <Button
              fontWeight="normal"
              onClick={() => setShowForgotPassword(true)}
              size="small"
              variation="link"
            >
              Forgot your password?
            </Button>
          </View>
        );
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Authenticator.Provider>
        {showForgotPassword ? (
          <ForgotPasswordForm onCancel={() => setShowForgotPassword(false)} />
        ) : (
          <Authenticator 
            hideSignUp={true} 
            components={components}
            loginMechanisms={['email']}
          >
            <AuthenticatedContent>{children}</AuthenticatedContent>
          </Authenticator>
        )}
      </Authenticator.Provider>
    </ThemeProvider>
  );
};

export default StyledAuthenticator;