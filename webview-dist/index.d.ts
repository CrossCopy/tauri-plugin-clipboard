export declare type Image = {
    width: number;
    height: number;
    bytes: number[];
};
export declare function execute(): Promise<unknown>;
export declare function write_text(text: string): Promise<void>;
export declare function read_text(): Promise<string>;
export declare function read_image(): Promise<any>;
export declare function write_image(data: any): Promise<void>;
