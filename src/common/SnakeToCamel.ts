//takes a snakecase converts to camel case
export function toCamelCase(str) {
  const pascal = str.replace(/(\_\w)/g, function (m) {
    return m[1].toUpperCase();
  });
  const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);
  return camel;
}