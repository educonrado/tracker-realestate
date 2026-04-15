export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      remates_activos: {
        Row: {
          id_proceso: string
          fecha_remate: string
          provincia: string | null
          canton: string
          sector: string | null
          tipo_bien: 'Terreno' | 'Casa' | 'Departamento' | 'Local' | null
          superficie_m2: number | null
          esta_ocupado: boolean | null
          coordenadas: string | null
          created_at: string | null
        }
        Insert: {
          id_proceso: string
          fecha_remate: string
          provincia?: string | null
          canton: string
          sector?: string | null
          tipo_bien?: 'Terreno' | 'Casa' | 'Departamento' | 'Local' | null
          superficie_m2?: number | null
          esta_ocupado?: boolean | null
          coordenadas?: string | null
          created_at?: string | null
        }
        Update: {
          id_proceso?: string
          fecha_remate?: string
          provincia?: string | null
          canton?: string
          sector?: string | null
          tipo_bien?: 'Terreno' | 'Casa' | 'Departamento' | 'Local' | null
          superficie_m2?: number | null
          esta_ocupado?: boolean | null
          coordenadas?: string | null
          created_at?: string | null
        }
      }
      remates_bitacora: {
        Row: {
          id: number
          id_proceso: string | null
          factor_tipo: 'Positivo' | 'Negativo' | null
          categoria: string | null
          comentario: string | null
          impacto_estimado_usd: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          id_proceso?: string | null
          factor_tipo?: 'Positivo' | 'Negativo' | null
          categoria?: string | null
          comentario?: string | null
          impacto_estimado_usd?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          id_proceso?: string | null
          factor_tipo?: 'Positivo' | 'Negativo' | null
          categoria?: string | null
          comentario?: string | null
          impacto_estimado_usd?: number | null
          created_at?: string | null
        }
      }
      remates_comparables: {
        Row: {
          id: number
          id_proceso: string | null
          fuente: string | null
          precio_solicitado: number | null
          m2_terreno: number | null
          precio_m2_calculado: number | null
          observaciones: string | null
          distancia_metros: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          id_proceso?: string | null
          fuente?: string | null
          precio_solicitado?: number | null
          m2_terreno?: number | null
          precio_m2_calculado?: number | null
          observaciones?: string | null
          distancia_metros?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          id_proceso?: string | null
          fuente?: string | null
          precio_solicitado?: number | null
          m2_terreno?: number | null
          precio_m2_calculado?: number | null
          observaciones?: string | null
          distancia_metros?: number | null
          created_at?: string | null
        }
      }
      remates_competencia: {
        Row: {
          id: number
          id_proceso: string | null
          estado: 'Ganado' | 'Perdido' | 'Desierto' | 'Pendiente' | null
          num_postores: number | null
          puja_ganadora: number | null
          delta_sobre_base_perc: number | null
        }
        Insert: {
          id?: number
          id_proceso?: string | null
          estado?: 'Ganado' | 'Perdido' | 'Desierto' | 'Pendiente' | null
          num_postores?: number | null
          puja_ganadora?: number | null
          delta_sobre_base_perc?: number | null
        }
        Update: {
          id?: number
          id_proceso?: string | null
          estado?: 'Ganado' | 'Perdido' | 'Desierto' | 'Pendiente' | null
          num_postores?: number | null
          puja_ganadora?: number | null
          delta_sobre_base_perc?: number | null
        }
      }
      remates_finanzas: {
        Row: {
          id: number
          id_proceso: string | null
          avaluo_pericial: number | null
          valor_base: number | null
          puja_propuesta: number | null
          gastos_est_adquisicion: number | null
          precio_venta_objetivo: number | null
          puja_final_real: number | null
          gastos_reales: number | null
          precio_venta_real: number | null
          fecha_venta_real: string | null
          utilidad_neta_real: number | null
          num_senalamiento: 1 | 2 | 3 | null
        }
        Insert: {
          id?: number
          id_proceso?: string | null
          avaluo_pericial?: number | null
          valor_base?: number | null
          puja_propuesta?: number | null
          gastos_est_adquisicion?: number | null
          precio_venta_objetivo?: number | null
          puja_final_real?: number | null
          gastos_reales?: number | null
          precio_venta_real?: number | null
          fecha_venta_real?: string | null
          utilidad_neta_real?: number | null
          num_senalamiento?: 1 | 2 | 3 | null
        }
        Update: {
          id?: number
          id_proceso?: string | null
          avaluo_pericial?: number | null
          valor_base?: number | null
          puja_propuesta?: number | null
          gastos_est_adquisicion?: number | null
          precio_venta_objetivo?: number | null
          puja_final_real?: number | null
          gastos_reales?: number | null
          precio_venta_real?: number | null
          fecha_venta_real?: string | null
          utilidad_neta_real?: number | null
          num_senalamiento?: 1 | 2 | 3 | null
        }
      }
      remates_fotos: {
        Row: {
          id: number
          id_proceso: string | null
          url_foto: string
          descripcion: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          id_proceso?: string | null
          url_foto: string
          descripcion?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          id_proceso?: string | null
          url_foto?: string
          descripcion?: string | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
