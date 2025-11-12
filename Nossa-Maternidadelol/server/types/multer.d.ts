/**
 * Type declarations para multer
 */
declare module 'multer' {
  import { Request } from 'express';

  interface StorageEngine {
    _handleFile(req: Request, file: Express.Multer.File, callback: (error?: any, info?: Partial<Express.Multer.File>) => void): void;
    _removeFile(req: Request, file: Express.Multer.File, callback: (error: Error | null) => void): void;
  }

  interface Options {
    dest?: string;
    storage?: StorageEngine;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      headerPairs?: number;
    };
    fileFilter?: (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => void;
  }

  interface Multer {
    (options?: Options): any;
    memoryStorage(): StorageEngine;
    diskStorage(options: { destination?: string | ((req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => void); filename?: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => void }): StorageEngine;
  }

  const multer: Multer;
  export = multer;
}

