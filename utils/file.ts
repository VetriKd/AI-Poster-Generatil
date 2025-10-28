
/**
 * Converts a data URL string to a File object.
 * @param dataUrl The data URL to convert.
 * @param fileName The name of the file.
 * @returns A Promise that resolves to a File object.
 */
export const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type });
};
