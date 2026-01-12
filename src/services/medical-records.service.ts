import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface MedicalRecord {
  id: string;
  client_id: number;
  date: string;
  clinical_notes: string | null;
  observations: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMedicalRecordInput {
  client_id: number;
  date?: string;
  clinical_notes?: string;
  observations?: string;
}

export interface UpdateMedicalRecordInput {
  clinical_notes?: string;
  observations?: string;
}

export class MedicalRecordsService {
  // Get all medical records for a client
  static async getMedicalRecords(clientId: number) {
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .eq("client_id", clientId)
        .order("date", { ascending: false });

      if (error) throw error;
      return { success: true, data: data as MedicalRecord[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get latest medical record for a client
  static async getLatestMedicalRecord(clientId: number) {
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .eq("client_id", clientId)
        .order("date", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      return { success: true, data: data as MedicalRecord | null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Create a new medical record
  static async createMedicalRecord(input: CreateMedicalRecordInput) {
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as MedicalRecord };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update an existing medical record
  static async updateMedicalRecord(id: string, input: UpdateMedicalRecordInput) {
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as MedicalRecord };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete a medical record
  static async deleteMedicalRecord(id: string) {
    try {
      const { error } = await supabase
        .from("medical_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
