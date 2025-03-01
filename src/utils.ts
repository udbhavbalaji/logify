const getFormattedJSON = (
  obj: Record<any, any> | Array<any>,
  indentLevel: number = 0,
): string => {
  let output = "";
  let indent = "  ".repeat(indentLevel);

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";

    output += "[\n";

    obj.forEach((item) => {
      if (typeof item === "object") {
        output += `${indent}  ${getFormattedJSON(item, indentLevel + 1)},\n`;
      } else {
        output += `${indent}  ${item},\n`;
      }
    });

    output += `${indent}]`;
  } else {
    const props = Object.keys(obj);

    if (props.length === 0) return "{}";

    output += "{\n";

    for (const prop of props) {
      if (typeof obj[prop] === "object") {
        output += `${indent}  ${prop}: ${getFormattedJSON(obj[prop], indentLevel + 1)},\n`;
      } else {
        output += `${indent}  ${prop}: ${obj[prop]},\n`;
      }
    }

    output += `${indent}}`;
  }

  return output;
};

const getFormattedJSONTypes = (
  obj: Record<any, any> | Array<any>,
  indentLevel: number = 0,
): string => {
  let output = "";
  const indent = "  ".repeat(indentLevel);

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";

    output += "[\n";

    obj.forEach((item) => {
      if (typeof item === "object") {
        output += `${indent}  ${getFormattedJSONTypes(item, indentLevel + 1)},\n`;
      } else {
        output += `${indent}  ${typeof item},\n`;
      }
    });

    output += `${indent}]`;
  } else {
    const props = Object.keys(obj);

    if (props.length === 0) return "{}";

    output += "{\n";

    for (const prop of props) {
      if (typeof obj[prop] === "object") {
        output += `${indent}  ${prop}: ${getFormattedJSONTypes(obj[prop], indentLevel + 1)},\n`;
      } else {
        output += `${indent}  ${prop}: ${typeof obj[prop]},\n`;
      }
    }

    output += `${indent}}`;
  }

  return output;
};

export { getFormattedJSONTypes, getFormattedJSON };
