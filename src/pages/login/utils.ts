export function mapError(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes('invalid login credentials') || r.includes('invalid credentials'))
    return 'Incorrect email or password. Please try again.';
  if (r.includes('email not confirmed'))
    return 'Confirm your email first — check your inbox for the confirmation link.';
  if (r.includes('user already registered') || r.includes('already been registered'))
    return 'An account with this email already exists. Try signing in instead.';
  if (r.includes('password should be at least'))
    return 'Password must be at least 6 characters long.';
  if (r.includes('unable to validate email'))
    return 'Please enter a valid email address.';
  if (r.includes('rate limit') || r.includes('too many'))
    return 'Too many attempts. Wait a moment and try again.';
  if (r.includes('network') || r.includes('fetch'))
    return 'Network error — check your internet connection.';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}
