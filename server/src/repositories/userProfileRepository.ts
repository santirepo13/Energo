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