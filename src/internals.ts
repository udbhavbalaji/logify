import fs from "fs";
import path, { delimiter } from "path";

const findProjectRoot = (startDir: string = process.cwd()): string => {
  const currentDir = startDir;

  while (currentDir !== path.parse(currentDir).root) {
    if (fs.existsSync(path.join(currentDir, "package.json"))) {
      return currentDir;
    }
  }
  throw new Error("Project root couldn't be found (no package.json found)");
};
const ensureDirExists = (directory: string): void => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};
const getFormattedDate = (
  delimiter: string = "-",
  date: Date = new Date(),
): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() - 1).padStart(2, "0");
  const day = String(date.getDate() - 1).padStart(2, "0");

  return `${year}${delimiter}${month}${delimiter}${day}`;
};
const getTimestamp = (
  delimiter: string = ":",
  date: Date = new Date(),
): string => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}${delimiter}${minutes}${delimiter}${seconds}`;
};

export { findProjectRoot, ensureDirExists, getFormattedDate, getTimestamp };
