import { DatabaseFunction } from '../database/databasePool';
import { UserProfile } from '../models/userProfileModel';

export class UserProfileRepository {
  constructor(private db: DatabaseFunction) {}

  async getProfile(userId: number): Promise<UserProfile | null> {
    const [rows]: any = await this.db(
      'CALL sp_user_profiles_get_by_user(?)',
      [userId]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  hasRequiredFields(profile: UserProfile | null): boolean {
    return (
      profile != null &&
      profile.primer_nombre != null &&
      profile.primer_nombre.trim().length > 0 &&
      profile.primer_apellido != null &&
      profile.primer_apellido.trim().length > 0 &&
      profile.tipo_identificacion != null &&
      profile.tipo_identificacion.trim().length > 0 &&
      profile.numero_identificacion != null &&
      profile.numero_identificacion.trim().length > 0
    );
  }

  async createProfile(profileData: any): Promise<void> {
    await this.db(
      'CALL sp_user_profiles_upsert(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        profileData.user_id,
        profileData.primer_nombre,
        profileData.segundo_nombre,
        profileData.primer_apellido,
        profileData.segundo_apellido,
        profileData.tipo_identificacion,
        profileData.numero_identificacion,
        profileData.direccion,
        profileData.telefono
      ]
    );
  }

  async updateProfile(userId: number, profileData: any): Promise<void> {
    await this.db(
      'CALL sp_user_profiles_upsert(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        profileData.primer_nombre,
        profileData.segundo_nombre,
        profileData.primer_apellido,
        profileData.segundo_apellido,
        profileData.tipo_identificacion,
        profileData.numero_identificacion,
        profileData.direccion,
        profileData.telefono
      ]
    );
  }
}