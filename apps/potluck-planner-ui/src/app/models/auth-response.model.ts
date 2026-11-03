import { UserProfile } from './user-profile.model';

export interface AuthResponse {
  token: string;
  user: UserProfile;
}
