import { differenceInYears, parse, isValid, format } from "date-fns";

/**
 * Calcula a idade a partir da data de nascimento
 * @param birthDate - Data de nascimento (string ISO ou objeto Date)
 * @returns Idade em anos completos
 */
export function calculateAge(birthDate: string | Date): number {
  const date = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  
  if (!isValid(date)) {
    return 0;
  }
  
  return differenceInYears(new Date(), date);
}

/**
 * Formata data de nascimento para exibição (DD/MM/AAAA)
 * @param date - Data em formato ISO (YYYY-MM-DD) ou Date
 * @returns Data formatada como DD/MM/AAAA
 */
export function formatBirthDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (!isValid(dateObj)) {
    return "";
  }
  
  return format(dateObj, "dd/MM/yyyy");
}

/**
 * Converte string DD/MM/AAAA para objeto Date
 * @param dateString - Data no formato DD/MM/AAAA
 * @returns Objeto Date ou null se inválido
 */
export function parseBirthDate(dateString: string): Date | null {
  if (!dateString || dateString.length !== 10) {
    return null;
  }
  
  const parsed = parse(dateString, "dd/MM/yyyy", new Date());
  
  if (!isValid(parsed)) {
    return null;
  }
  
  return parsed;
}

/**
 * Converte Date para formato ISO (YYYY-MM-DD) para o banco de dados
 * @param date - Objeto Date
 * @returns String no formato YYYY-MM-DD
 */
export function toISODate(date: Date): string {
  if (!isValid(date)) {
    return "";
  }
  
  return format(date, "yyyy-MM-dd");
}

/**
 * Aplica máscara de data DD/MM/AAAA
 * @param value - Valor digitado
 * @returns Valor com máscara aplicada
 */
export function maskDate(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "");
  
  // Aplica a máscara DD/MM/AAAA
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  } else {
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  }
}
