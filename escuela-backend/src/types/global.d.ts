// Type declarations for modules without proper types

declare module 'express' {
  import { IncomingMessage, ServerResponse } from 'http';

  export interface Request extends IncomingMessage {
    body?: any;
    cookies?: any;
    params?: any;
    query?: any;
    user?: any;
    headers: any;
    method: string;
    url: string;
    path: string;
    ip?: string;
    get(name: string): string | undefined;
  }

  export interface Response extends ServerResponse {
    status(code: number): Response;
    json(body: any): Response;
    send(body: any): Response;
    cookie(name: string, value: string, options?: any): Response;
    clearCookie(name: string, options?: any): Response;
    redirect(url: string): void;
    render(view: string, locals?: any): void;
    set(field: string, value: string): Response;
    get(field: string): string | undefined;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): any;
  }

  export interface ErrorRequestHandler {
    (err: any, req: Request, res: Response, next: NextFunction): any;
  }

  export interface Application {
    use(...handlers: RequestHandler[]): Application;
    get(path: string, ...handlers: RequestHandler[]): Application;
    post(path: string, ...handlers: RequestHandler[]): Application;
    put(path: string, ...handlers: RequestHandler[]): Application;
    delete(path: string, ...handlers: RequestHandler[]): Application;
    listen(port: number, callback?: () => void): any;
  }

  function express(): Application;
  export default express;
}

declare module 'bcrypt' {
  export function hash(data: string, saltOrRounds: number | string): Promise<string>;
  export function hashSync(data: string, saltOrRounds: number | string): string;
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function compareSync(data: string, encrypted: string): boolean;
  export function genSalt(rounds?: number): Promise<string>;
  export function genSaltSync(rounds?: number): string;
  export function getRounds(encrypted: string): number;
}

declare module 'compression' {
  import { RequestHandler } from 'express';

  interface CompressionOptions {
    chunkSize?: number;
    filter?: (req: any, res: any) => boolean;
    level?: number;
    memLevel?: number;
    strategy?: number;
    threshold?: number | string;
    windowBits?: number;
  }

  function compression(options?: CompressionOptions): RequestHandler;
  export default compression;
}

declare module 'cookie-parser' {
  import { RequestHandler } from 'express';

  interface CookieParseOptions {
    decode?: (val: string) => string;
  }

  function cookieParser(secret?: string | string[], options?: CookieParseOptions): RequestHandler;
  export default cookieParser;
}

declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport';

  export interface StrategyOptions {
    secretOrKey?: string | Buffer;
    secretOrKeyProvider?: (request: any, rawJwtToken: any, done: (err: any, secretOrKey?: string | Buffer) => void) => void;
    jwtFromRequest: JwtFromRequestFunction;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
    jsonWebTokenOptions?: any;
  }

  export interface VerifyCallback {
    (payload: any, done: VerifiedCallback): void;
  }

  export interface VerifyCallbackWithRequest {
    (req: any, payload: any, done: VerifiedCallback): void;
  }

  export interface VerifiedCallback {
    (error: any, user?: any, info?: any): void;
  }

  export type JwtFromRequestFunction = (req: any) => string | null;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyCallback | VerifyCallbackWithRequest);
  }

  export namespace ExtractJwt {
    function fromHeader(header_name: string): JwtFromRequestFunction;
    function fromBodyField(field_name: string): JwtFromRequestFunction;
    function fromUrlQueryParameter(param_name: string): JwtFromRequestFunction;
    function fromAuthHeaderWithScheme(auth_scheme: string): JwtFromRequestFunction;
    function fromAuthHeaderAsBearerToken(): JwtFromRequestFunction;
    function fromExtractors(extractors: JwtFromRequestFunction[]): JwtFromRequestFunction;
  }
}
