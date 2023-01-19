export declare function writeText(text: string): Promise<void>;
export declare function readText(): Promise<string>;
/**
 * read clipboard image
 * @returns image in base64 string
 */
export declare function readImage(): Promise<string>;
export declare function writeImage(data: string): Promise<void>;
