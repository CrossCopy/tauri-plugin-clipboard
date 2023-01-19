export declare type Image = {
    width: number;
    height: number;
    bytes: number[];
};
export declare function execute(): Promise<unknown>;
export declare function write_text(text: string): Promise<void>;
export declare function read_text(): Promise<string>;
/**
 * read clipboard image
 * @returns image in base64 string
 */
export declare function read_image(): Promise<string>;
export declare function write_image(data: string): Promise<void>;
