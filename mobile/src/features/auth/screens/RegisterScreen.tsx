import React, { useState } from 'react';

import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import SafeScreen from '../../../components/layout/SafeScreen';
import { useAuth } from '../../../app/providers/AuthProvider';

const COLORS = {
  primary: '#2563EB',
  background: '#F8FAFC',
  white: '#FFFFFF',
  text: '#172033',
  secondary: '#64748B',
  border: '#E2E8F0',
  danger: '#DC2626',
  lightBlue: '#EFF6FF',
};

const DEPARTMENTS = [
  'Software Engineering',
  'Computer Science',
  'Information Technology',
  'Information Systems',
  'Electrical Engineering',
  'Civil Engineering',
  'Mechanical Engineering',
  'Accounting',
  'Management',
  'Other',
];

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showDepartments, setShowDepartments] =
    useState(false);

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return false;
    }

    if (fullName.trim().length < 3) {
      setError('Your name must contain at least 3 characters.');
      return false;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      setError('Please enter your email address.');
      return false;
    }

    if (!emailPattern.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (phone.trim()) {
      const phonePattern = /^[+0-9\s()-]{7,20}$/;

      if (!phonePattern.test(phone.trim())) {
        setError('Please enter a valid phone number.');
        return false;
      }
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setError(
        'Password must contain at least one uppercase letter.',
      );
      return false;
    }

    if (!/[a-z]/.test(password)) {
      setError(
        'Password must contain at least one lowercase letter.',
      );
      return false;
    }

    if (!/[0-9]/.test(password)) {
      setError(
        'Password must contain at least one number.',
      );
      return false;
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        ...(phone.trim()
          ? { phone: phone.trim() }
          : {}),
        ...(studentId.trim()
          ? { studentId: studentId.trim() }
          : {}),
        ...(department.trim()
          ? { department: department.trim() }
          : {}),
      });

      navigation.navigate('VerifyEmail', {
        email: email.trim().toLowerCase(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to create your account. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    placeholder: string,
    options?: {
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      autoCapitalize?: 'none' | 'sentences' | 'words';
      secureTextEntry?: boolean;
    },
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setError('');
        }}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={options?.keyboardType || 'default'}
        autoCapitalize={options?.autoCapitalize || 'sentences'}
        secureTextEntry={options?.secureTextEntry}
        autoCorrect={false}
      />
    </View>
  );

  return (
    <SafeScreen
      backgroundColor={COLORS.background}
      statusBarStyle="dark-content"
      keyboardAvoiding
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.heading}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>IU</Text>
            </View>

            <Text style={styles.title}>
              Create your account
            </Text>

            <Text style={styles.subtitle}>
              Join the Injibara University Lost & Found
              community.
            </Text>
          </View>

          <View style={styles.form}>
            {renderInput(
              'Full name *',
              fullName,
              setFullName,
              'Enter your full name',
            )}

            {renderInput(
              'Email address *',
              email,
              setEmail,
              'Enter your email address',
              {
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              },
            )}

            {renderInput(
              'Phone number',
              phone,
              setPhone,
              'Enter your phone number (optional)',
              {
                keyboardType: 'phone-pad',
              },
            )}

            {renderInput(
              'Student ID',
              studentId,
              setStudentId,
              'Enter your student ID (optional)',
              {
                autoCapitalize: 'none',
              },
            )}

            <View style={styles.field}>
              <Text style={styles.label}>
                Department
              </Text>

              <Pressable
                onPress={() =>
                  setShowDepartments((current) => !current)
                }
                style={styles.selectButton}
              >
                <Text
                  style={[
                    styles.selectText,
                    !department && styles.placeholder,
                  ]}
                >
                  {department || 'Select your department (optional)'}
                </Text>

                <Text style={styles.selectArrow}>
                  {showDepartments ? '⌃' : '⌄'}
                </Text>
              </Pressable>

              {showDepartments ? (
                <View style={styles.departmentList}>
                  {DEPARTMENTS.map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => {
                        setDepartment(item);
                        setShowDepartments(false);
                        setError('');
                      }}
                      style={styles.departmentOption}
                    >
                      <Text
                        style={[
                          styles.departmentText,
                          department === item &&
                            styles.selectedDepartment,
                        ]}
                      >
                        {item}
                      </Text>

                      {department === item ? (
                        <Text style={styles.checkMark}>✓</Text>
                      ) : null}
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Password *
              </Text>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setError('');
                  }}
                  placeholder="Create a strong password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                />

                <Pressable
                  onPress={() =>
                    setShowPassword((current) => !current)
                  }
                  style={styles.showButton}
                >
                  <Text style={styles.showText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.helperText}>
                Use at least 8 characters, including
                uppercase, lowercase, and a number.
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Confirm password *
              </Text>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    setError('');
                  }}
                  placeholder="Enter your password again"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />

                <Pressable
                  onPress={() =>
                    setShowConfirmPassword(
                      (current) => !current,
                    )
                  }
                  style={styles.showButton}
                >
                  <Text style={styles.showText}>
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>!</Text>

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleRegister}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.pressed,
                loading && styles.disabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitText}>
                  Create Account
                </Text>
              )}
            </Pressable>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginDescription}>
              Already have an account?
            </Text>

            <Pressable
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLink}>
                Sign In
              </Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>
            By creating an account, you agree to use this
            platform responsibly and follow campus policies.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 25,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    alignSelf: 'flex-start',
  },

  backIcon: {
    fontSize: 30,
    color: COLORS.text,
    marginRight: 7,
  },

  backText: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: '600',
  },

  heading: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 25,
  },

  logo: {
    width: 59,
    height: 59,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  logoText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
  },

  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },

  subtitle: {
    color: COLORS.secondary,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },

  form: {
    gap: 17,
  },

  field: {
    gap: 8,
  },

  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 12,
  },

  selectButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectText: {
    color: COLORS.text,
    fontSize: 12,
    flex: 1,
  },

  placeholder: {
    color: '#94A3B8',
  },

  selectArrow: {
    color: COLORS.secondary,
    fontSize: 20,
    marginLeft: 8,
  },

  departmentList: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  departmentOption: {
    minHeight: 42,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },

  departmentText: {
    color: COLORS.text,
    fontSize: 11,
  },

  selectedDepartment: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  checkMark: {
    color: COLORS.primary,
    fontWeight: '900',
  },

  passwordContainer: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
  },

  passwordInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    paddingVertical: 12,
  },

  showButton: {
    paddingHorizontal: 5,
    paddingVertical: 8,
  },

  showText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
  },

  helperText: {
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 15,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 11,
    padding: 11,
    gap: 8,
  },

  errorIcon: {
    color: COLORS.white,
    backgroundColor: COLORS.danger,
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: 'center',
    fontWeight: '900',
  },

  errorText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 11,
    lineHeight: 16,
  },

  submitButton: {
    minHeight: 53,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  submitText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
  },

  disabled: {
    opacity: 0.6,
  },

  pressed: {
    opacity: 0.75,
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 23,
    gap: 6,
  },

  loginDescription: {
    color: COLORS.secondary,
    fontSize: 11,
  },

  loginLink: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
  },

  footer: {
    color: COLORS.secondary,
    fontSize: 9,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default RegisterScreen;