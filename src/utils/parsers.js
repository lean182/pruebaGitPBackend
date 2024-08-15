// Parsea el valor a un número entero, o devuelve el valor predeterminado si no se puede convertir
export function parseIntOrDefault(value, defaultValue) {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Parsear el valor a booleano, o devuelve el valor predeterminado si no se puede convertir
export function parseBooleanOrDefault(value, defaultValue) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
}
